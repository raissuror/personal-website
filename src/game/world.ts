/**
 * Loads the Tiled world from public/assets/world.
 *
 * Phaser can't read external tilesets (.tsj) or image-collection tilesets on its own,
 * so we fetch the map and its tilesets here and hand the scene plain data.
 * Edit public/assets/world/maps/outpost.tmj in Tiled, save, and refresh.
 */
import { WORLD_BASE } from './npcs';

export interface TiledProperty { name: string; type: string; value: unknown }

export interface TiledObject {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  visible?: boolean;
  gid?: number;
  point?: boolean;
  properties?: TiledProperty[];
}

export interface TiledLayer {
  name: string;
  type: 'tilelayer' | 'objectgroup' | string;
  visible?: boolean;
  opacity?: number;
  objects?: TiledObject[];
}

interface TiledTile { id: number; image?: string; imagewidth?: number; imageheight?: number }

export interface Tileset {
  name: string;
  firstgid: number;
  image?: string;
  tiles?: TiledTile[];
  [key: string]: unknown;
}

export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  tilesets: Array<{ firstgid: number; source?: string } & Partial<Tileset>>;
  [key: string]: unknown;
}

export interface PropArt { key: string; url: string; width: number; height: number }

export interface AnimationDef { url: string; frameWidth: number; frameHeight: number; frames: number; fps: number }

export interface WorldData {
  map: TiledMap;
  /** Tilesets with a single atlas image (used by the tile layers). */
  imageTilesets: Array<Tileset & { imageUrl: string }>;
  /** Image-collection tiles by gid (used by object layers). */
  props: Map<number, PropArt>;
  animations: Record<string, AnimationDef & { url: string }>;
  widthPx: number;
  heightPx: number;
}

const readJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} loading ${url}`);
  return res.json() as Promise<T>;
};

const resolve = (file: string, base: string) => new URL(file, base).href;

export async function loadWorld(): Promise<WorldData> {
  const base = new URL(WORLD_BASE, document.baseURI).href;
  const mapUrl = resolve('maps/outpost.tmj', base);
  const animUrl = resolve('animations.json', base);

  const [map, rawAnimations] = await Promise.all([
    readJson<TiledMap>(mapUrl),
    readJson<Record<string, AnimationDef>>(animUrl),
  ]);

  const tilesets = await Promise.all(
    map.tilesets.map(async (ref) => {
      const url = ref.source ? resolve(ref.source, mapUrl) : mapUrl;
      const ts = ref.source ? await readJson<Tileset>(url) : (ref as Tileset);
      return { ...ts, firstgid: ref.firstgid, baseUrl: url };
    }),
  );

  const imageTilesets = tilesets
    .filter((ts) => ts.image)
    .map((ts) => ({ ...ts, imageUrl: resolve(ts.image!, ts.baseUrl) }));

  const props = new Map<number, PropArt>();
  for (const ts of tilesets) {
    for (const tile of ts.tiles ?? []) {
      if (!tile.image) continue;
      const gid = ts.firstgid + tile.id;
      props.set(gid, {
        key: `prop-${gid}`,
        url: resolve(tile.image, ts.baseUrl),
        width: tile.imagewidth ?? 0,
        height: tile.imageheight ?? 0,
      });
    }
  }

  const animations = Object.fromEntries(
    Object.entries(rawAnimations).map(([key, a]) => [key, { ...a, url: resolve(a.url, animUrl) }]),
  );

  // Make sure the pixel font is ready before Phaser draws NPC labels (don't block for long).
  await Promise.race([
    document.fonts?.load('8px "Press Start 2P"').catch(() => undefined),
    new Promise((r) => setTimeout(r, 1500)),
  ]);

  return {
    map,
    imageTilesets,
    props,
    animations,
    widthPx: map.width * map.tilewidth,
    heightPx: map.height * map.tileheight,
  };
}

export const objectsIn = (map: TiledMap, layerName: string): TiledObject[] =>
  map.layers.find((l) => l.name === layerName)?.objects ?? [];
