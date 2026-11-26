import Phaser from 'phaser';
import { sound } from '../audio/sound';
import { CAREER } from '../content/career';
import { projectById } from '../content/projects';
import { secretById } from '../content/secrets';
import { GameEvent, RegistryKey, type SpotKind, type SpotRef } from './bridge';
import { NPCS, isNpcId } from './npcs';
import { objectsIn, type WorldData } from './world';

const WALK_SPEED = 66;
const RUN_SPEED = 104;
/** Max distance (px) between the player's feet and a spot to interact, per kind. */
const TALK_RADIUS: Record<SpotKind, number> = { npc: 28, project: 26, secret: 18, trail: 20 };
/** NPCs notice you (a "!" pops up) the first time you come this close. */
const GREET_RADIUS = 64;
/** Ignore talk input briefly after a modal closes, so the closing key press doesn't reopen it. */
const RESUME_GRACE_MS = 250;
const PLAYER_IDLE = 'north-pole-parka-idle-south';
/** Time between footstep sounds (ms). */
const STEP_MS = { walk: 330, run: 230 };
/** Distance walked (px) between footprints, and how long they take to fade (ms). */
const FOOTPRINT_EVERY = 7;
const FOOTPRINT_FADE_MS = 6000;

// Layering: ground < footprints < world (y-sorted) < night tint < lights < labels < snow < bubbles.
const DEPTH = {
  ground: -1000,
  footprints: -900,
  night: 98000,
  lights: 98100,
  labels: 99000,
  snow: 99200,
  bubbles: 99500,
  debug: 100000,
} as const;

const GID_MASK = 0x1fffffff;
const FLIP_H = 0x80000000;
const FLIP_V = 0x40000000;

const INK = 0x1d3340;
const SNOW = 0xf7f7ef;
const EMBER = 0xe8894a;

type Facing = 'north' | 'south' | 'east' | 'west';
type Keys = Record<'W' | 'A' | 'S' | 'D' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'SHIFT', Phaser.Input.Keyboard.Key>;
type TimeOfDay = 'day' | 'dusk' | 'night';

const TALK_KEYS = new Set(['e', ' ', 'enter']);

interface Spot extends SpotRef {
  x: number;
  y: number;
  radius: number;
  /** Name tag above NPCs and trail signposts; hidden while you're next to it. */
  label?: Phaser.GameObjects.Text;
  sprite?: Phaser.GameObjects.Sprite;
  /** Floating marker over project landmarks. */
  marker?: Phaser.GameObjects.Graphics;
  greeted?: boolean;
}

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** Visitor's local time, or `?time=day|dusk|night` to preview. */
function timeOfDay(): TimeOfDay {
  const forced = new URLSearchParams(window.location.search).get('time');
  if (forced === 'day' || forced === 'dusk' || forced === 'night') return forced;
  const h = new Date().getHours();
  if (h >= 20 || h < 5) return 'night';
  if (h >= 17 || h < 7) return 'dusk';
  return 'day';
}

export class WorldScene extends Phaser.Scene {
  private world!: WorldData;
  private player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Keys;
  private spots: Spot[] = [];
  private nearby: Spot | null = null;
  private bubble!: Phaser.GameObjects.Graphics;
  private debug!: Phaser.GameObjects.Graphics;
  private labels: Phaser.GameObjects.Text[] = [];
  private facing: Facing = 'south';
  /** Set by a talk key / TALK button; consumed on the next update. */
  private talkRequested = false;
  private resumeAt = 0;
  private stepTimer = 0;
  private stride = 0;
  private leftFoot = false;
  private lastPos = { x: 0, y: 0 };
  /** Where new snowflakes spawn; tracks the camera's view each frame. */
  private snowZone: Phaser.Geom.Rectangle | null = null;
  private reducedMotion = false;

  constructor() {
    super('World');
  }

  init() {
    this.world = this.registry.get(RegistryKey.WORLD);
    this.spots = [];
    this.labels = [];
    this.nearby = null;
    this.reducedMotion = prefersReducedMotion();
  }

  preload() {
    for (const ts of this.world.imageTilesets) this.load.image(ts.name, ts.imageUrl);
    for (const art of this.world.props.values()) this.load.image(art.key, art.url);
    for (const [key, a] of Object.entries(this.world.animations)) {
      this.load.spritesheet(key, a.url, { frameWidth: a.frameWidth, frameHeight: a.frameHeight });
    }
  }

  create() {
    const { map, widthPx, heightPx } = this.world;

    this.createTextures();
    this.createAnimations();
    this.createGround();
    const critters = this.createScenery();
    const solids = this.createSolids();
    this.createNpcs(solids);
    this.createProjectSpots();
    this.createSecretSpots(solids);
    this.createTrail(solids);
    this.createPlayer(solids);
    this.createBubble();
    this.createLighting();
    this.createSnow();
    this.animateCritters(critters);

    this.physics.world.setBounds(0, 0, widthPx, heightPx);
    this.cameras.main
      .setBounds(0, 0, widthPx, heightPx)
      .setRoundPixels(true)
      .startFollow(this.player, true, 0.12, 0.12);
    this.fitCamera();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.fitCamera, this);

    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT') as Keys;
    this.input.keyboard!.addCapture('SPACE,ENTER');
    // Use keydown events, not JustDown polling: a tap whose down+up land in the same frame
    // clears JustDown before update() sees it, so quick presses would be silently dropped.
    this.input.keyboard!.on('keydown', this.onKeyDown, this);
    this.setPaused(Boolean(this.registry.get(RegistryKey.PAUSED)));
    this.registry.events.on(`changedata-${RegistryKey.PAUSED}`, this.onPausedChange, this);
    this.game.events.on(GameEvent.VIRTUAL_INTERACT, this.onVirtualInteract, this);

    // F2 shows collision boxes and talk radii — handy after editing the map in Tiled.
    this.debug = this.add.graphics().setDepth(DEPTH.debug).setVisible(false);
    this.debug.lineStyle(1, 0xe87864, 0.9);
    for (const o of objectsIn(map, 'Collision')) this.debug.strokeRect(o.x, o.y, o.width, o.height);
    this.debug.lineStyle(1, 0xf2cc85, 0.9);
    for (const s of this.spots) this.debug.strokeCircle(s.x, s.y, s.radius);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.fitCamera, this);
      this.registry.events.off(`changedata-${RegistryKey.PAUSED}`, this.onPausedChange, this);
      this.game.events.off(GameEvent.VIRTUAL_INTERACT, this.onVirtualInteract, this);
    });

    this.game.events.emit(GameEvent.READY);
  }

  // ---------------------------------------------------------------- world building

  /** Small generated textures: footprint, snowflakes, light glow, bottle. */
  private createTextures() {
    const draw = (key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({}, false);
      paint(g);
      g.generateTexture(key, w, h);
      g.destroy();
    };
    draw('footprint', 2, 2, (g) => g.fillStyle(0x9fbfcb).fillRect(0, 0, 2, 1).fillStyle(0xc4dae1).fillRect(0, 1, 2, 1));
    // White flake with a blue drop shadow, so it reads on both snow and water.
    for (const [key, size] of [['flake-s', 1], ['flake-l', 2]] as const) {
      draw(key, size + 1, size + 1, (g) => g.fillStyle(0x7ea8b8).fillRect(1, 1, size, size).fillStyle(0xffffff).fillRect(0, 0, size, size));
    }
    draw('bottle', 9, 5, (g) => {
      g.fillStyle(INK).fillRect(1, 0, 6, 5).fillRect(7, 1, 2, 3);
      g.fillStyle(0x7fc4a4).fillRect(2, 1, 5, 3);
      g.fillStyle(0xf2e6c4).fillRect(3, 2, 3, 1);
      g.fillStyle(0xb98a5a).fillRect(7, 2, 2, 1);
    });

    if (!this.textures.exists('glow')) {
      const size = 64;
      const canvas = this.textures.createCanvas('glow', size, size)!;
      const ctx = canvas.getContext();
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.45)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      canvas.refresh();
    }
  }

  private createAnimations() {
    for (const [key, a] of Object.entries(this.world.animations)) {
      if (this.anims.exists(key)) continue;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: a.frames - 1 }),
        frameRate: a.fps,
        repeat: -1,
      });
    }
  }

  private createGround() {
    const { map, imageTilesets } = this.world;
    const tileLayers = map.layers.filter((l) => l.type === 'tilelayer');
    this.cache.tilemap.add('world', {
      format: Phaser.Tilemaps.Formats.TILED_JSON,
      data: { ...map, tilesets: imageTilesets, layers: tileLayers },
    });
    const tilemap = this.make.tilemap({ key: 'world' });
    const sets = imageTilesets
      .map((ts) => tilemap.addTilesetImage(ts.name, ts.name))
      .filter((ts): ts is Phaser.Tilemaps.Tileset => ts !== null);
    for (const l of tileLayers) {
      tilemap.createLayer(l.name, sets)?.setVisible(l.visible !== false).setAlpha(l.opacity ?? 1).setDepth(DEPTH.ground);
    }
  }

  /** Places the Scenery layer. Returns the animated animals so they can fidget. */
  private createScenery() {
    const critters: Phaser.GameObjects.Sprite[] = [];
    const layer = this.world.map.layers.find((l) => l.name === 'Scenery');
    if (!layer || layer.visible === false) return critters;
    for (const o of layer.objects ?? []) {
      if (o.visible === false || o.gid === undefined) continue;
      const art = this.world.props.get(o.gid & GID_MASK);
      if (!art) {
        console.warn(`Scenery object ${o.id} uses unknown gid ${o.gid}`);
        continue;
      }
      const sprite = this.add
        .sprite(o.x, o.y, art.key)
        .setOrigin(0, 1) // Tiled tile objects are anchored bottom-left
        .setDepth(o.y - 3)
        .setDisplaySize(o.width || art.width, o.height || art.height)
        .setAngle(o.rotation ?? 0)
        .setFlip(Boolean(o.gid & FLIP_H), Boolean(o.gid & FLIP_V));
      const animation = o.properties?.find((p) => p.name === 'animation')?.value;
      if (typeof animation === 'string' && this.anims.exists(animation)) {
        sprite.play(animation);
        if (/fox|seal|sled-dog/.test(animation)) critters.push(sprite);
      }
    }
    return critters;
  }

  private createSolids() {
    const solids = this.physics.add.staticGroup();
    for (const o of objectsIn(this.world.map, 'Collision')) {
      const zone = this.add.zone(o.x + o.width / 2, o.y + o.height / 2, o.width, o.height);
      solids.add(zone);
    }
    return solids;
  }

  private addLabel(x: number, y: number, text: string) {
    const label = this.add
      .text(x, y, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '4px',
        color: '#f7f7ef',
        backgroundColor: '#1d3340',
        padding: { x: 2, y: 2 },
      })
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.labels);
    this.labels.push(label);
    return label;
  }

  private createNpcs(solids: Phaser.Physics.Arcade.StaticGroup) {
    for (const o of objectsIn(this.world.map, 'NPCs')) {
      if (o.type !== 'npc' || !isNpcId(o.name)) {
        console.warn(`NPCs layer: ignoring object "${o.name}" (expected type "npc" and a name in NPCS)`);
        continue;
      }
      const info = NPCS[o.name];
      const sprite = this.add.sprite(o.x, o.y, info.sprite).setOrigin(0.5, 1).setDepth(o.y - 3);
      if (this.anims.exists(info.sprite)) sprite.play(info.sprite);

      // Small footprint so the player bumps into the NPC instead of walking through it.
      solids.add(this.add.zone(o.x, o.y - 5, 18, 10));

      const label = this.addLabel(o.x, o.y - 30, info.section.toUpperCase());
      this.spots.push({ kind: 'npc', id: o.name, x: o.x, y: o.y, radius: TALK_RADIUS.npc, label, sprite });
    }
  }

  /** A bobbing ember diamond over each project landmark. */
  private createProjectSpots() {
    for (const o of objectsIn(this.world.map, 'Projects')) {
      if (!projectById(o.name)) {
        console.warn(`Projects layer: no project with id "${o.name}" in src/content/projects.ts`);
        continue;
      }
      const marker = this.add.graphics().setDepth(DEPTH.labels);
      marker.fillStyle(INK).fillRect(-1, -4, 3, 9).fillRect(-3, -2, 7, 5).fillRect(-2, -3, 5, 7);
      marker.fillStyle(EMBER).fillRect(0, -3, 1, 7).fillRect(-2, -1, 5, 3).fillRect(-1, -2, 3, 5);
      marker.fillStyle(0xffd9b0).fillRect(0, -2, 1, 1);
      marker.setPosition(o.x, o.y - 20);
      if (!this.reducedMotion) {
        this.tweens.add({ targets: marker, y: o.y - 23, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }
      this.spots.push({ kind: 'project', id: o.name, x: o.x, y: o.y, radius: TALK_RADIUS.project, marker });
    }
  }

  private createSecretSpots(solids: Phaser.Physics.Arcade.StaticGroup) {
    for (const o of objectsIn(this.world.map, 'Secrets')) {
      if (!secretById(o.name)) {
        console.warn(`Secrets layer: no secret with id "${o.name}" in src/content/secrets.ts`);
        continue;
      }
      if (o.name === 'bottle') {
        const bottle = this.add.image(o.x, o.y, 'bottle').setOrigin(0.5, 1).setDepth(o.y - 3);
        if (!this.reducedMotion) {
          this.tweens.add({ targets: bottle, angle: { from: -6, to: 6 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        }
      }
      // The fox is an animal you shouldn't be able to walk through.
      if (o.name === 'fox') solids.add(this.add.zone(o.x, o.y - 6, 14, 6));
      this.spots.push({ kind: 'secret', id: o.name, x: o.x, y: o.y, radius: TALK_RADIUS.secret });
    }
  }

  /** One signpost per career stop, along the path south of camp. */
  private createTrail(solids: Phaser.Physics.Arcade.StaticGroup) {
    if (!CAREER.length) return;
    const sign = [...this.world.props.values()].find((a) => a.url.endsWith('prop-016.png'));
    const points = objectsIn(this.world.map, 'Trail');
    points.slice(0, CAREER.length).forEach((o, i) => {
      if (sign) this.add.image(o.x, o.y, sign.key).setOrigin(0.5, 1).setDepth(o.y - 3);
      solids.add(this.add.zone(o.x, o.y - 3, 6, 6));
      const label = this.addLabel(o.x, o.y - 30, CAREER[i].when.toUpperCase());
      this.spots.push({ kind: 'trail', id: String(i), x: o.x, y: o.y + 4, radius: TALK_RADIUS.trail, label });
    });
  }

  private createPlayer(solids: Phaser.Physics.Arcade.StaticGroup) {
    const spawn = objectsIn(this.world.map, 'Spawns').find((o) => o.name === 'player');
    const x = spawn?.x ?? this.world.widthPx / 2;
    const y = spawn?.y ?? this.world.heightPx / 2;
    this.player = this.physics.add.sprite(x, y, PLAYER_IDLE).setOrigin(0.5, 1).setDepth(y - 3);
    this.player.body!.setSize(10, 7).setOffset(11, 22);
    this.player.setCollideWorldBounds(true);
    this.player.play(PLAYER_IDLE);
    this.physics.add.collider(this.player, solids);
    this.lastPos = { x, y };
  }

  /** "…" speech bubble shown above the thing you can interact with. */
  private createBubble() {
    const g = this.add.graphics().setDepth(DEPTH.bubbles).setVisible(false);
    g.fillStyle(INK).fillRect(-6, -6, 13, 9).fillRect(-1, 3, 3, 2);
    g.fillStyle(SNOW).fillRect(-5, -5, 11, 7).fillRect(0, 2, 1, 2);
    g.fillStyle(INK).fillRect(-3, -2, 1, 1).fillRect(0, -2, 1, 1).fillRect(3, -2, 1, 1);
    this.bubble = g;
  }

  /** Dusk / night tint from the visitor's clock, with warm light around fires and lamps. */
  private createLighting() {
    const phase = timeOfDay();
    if (phase === 'day') return;
    const night = phase === 'night';
    const { widthPx, heightPx } = this.world;
    this.add
      .rectangle(0, 0, widthPx, heightPx, night ? 0x0b1830 : 0x3a2a55, night ? 0.5 : 0.22)
      .setOrigin(0)
      .setDepth(DEPTH.night);

    const layer = this.world.map.layers.find((l) => l.name === 'Scenery');
    for (const o of layer?.objects ?? []) {
      const art = o.gid !== undefined ? this.world.props.get(o.gid & GID_MASK) : undefined;
      const file = art?.url.split('/').pop() ?? '';
      const w = o.width || art?.width || 32;
      const h = o.height || art?.height || 32;
      let light: { x: number; y: number; scale: number; color: number } | null = null;
      if (file === 'prop-014.png') light = { x: o.x + w / 2, y: o.y - 10, scale: 2.2, color: 0xffa04a }; // campfire
      else if (file === 'prop-008.png') light = { x: o.x + w / 2, y: o.y - 16, scale: 1.1, color: 0xffc46b }; // lantern
      else if (file === 'prop-018.png') light = { x: o.x + w / 2, y: o.y - h + 26, scale: 1.8, color: 0xfff0b0 }; // lighthouse
      else if (file === 'prop-003.png' || file === 'prop-009.png') light = { x: o.x + w / 2, y: o.y - 14, scale: 0.8, color: 0xffc46b }; // hut windows
      if (!light) continue;

      const glow = this.add
        .image(light.x, light.y, 'glow')
        .setScale(light.scale)
        .setTint(light.color)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(night ? 0.75 : 0.45)
        .setDepth(DEPTH.lights);
      if (!this.reducedMotion) {
        this.tweens.add({
          targets: glow,
          alpha: glow.alpha * 0.7,
          scale: light.scale * 0.94,
          duration: 380 + Math.random() * 300,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
        });
      }
    }
  }

  /** Two layers of falling snow: small slow flakes and a few bigger, faster ones in front. */
  private createSnow() {
    this.snowZone = null;
    if (this.reducedMotion) return;

    // Spawn anywhere in view (not just the top edge), fading in and out, so the camera
    // can move freely and the screen is already snowy on the first frame.
    const zone = new Phaser.Geom.Rectangle(0, 0, 1, 1);
    this.snowZone = zone;
    const emitZone = { type: 'random', source: zone } as Phaser.Types.GameObjects.Particles.EmitZoneData;

    this.add
      .particles(0, 0, 'flake-s', {
        emitZone,
        lifespan: { min: 4000, max: 7000 },
        speedY: { min: 7, max: 14 },
        speedX: { min: -7, max: 2 },
        alpha: { values: [0, 0.85, 0.85, 0] },
        frequency: 35,
      })
      .setDepth(DEPTH.snow);
    this.add
      .particles(0, 0, 'flake-l', {
        emitZone,
        lifespan: { min: 3000, max: 5000 },
        speedY: { min: 16, max: 26 },
        speedX: { min: -10, max: 0 },
        alpha: { values: [0, 0.95, 0.95, 0] },
        frequency: 140,
      })
      .setDepth(DEPTH.snow + 1);
  }

  /** Animals now and then turn around or give a little hop. */
  private animateCritters(critters: Phaser.GameObjects.Sprite[]) {
    if (this.reducedMotion) return;
    for (const c of critters) {
      const fidget = () => {
        if (Math.random() < 0.6) c.toggleFlipX();
        else this.tweens.add({ targets: c, y: c.y - 3, duration: 110, yoyo: true, ease: 'Quad.out' });
        this.time.delayedCall(2500 + Math.random() * 4000, fidget);
      };
      this.time.delayedCall(1000 + Math.random() * 3000, fidget);
    }
  }

  private fitCamera() {
    const { width, height } = this.scale.gameSize;
    // Integer zoom keeps pixels crisp; aim for at least ~400×240 world pixels on screen.
    const zoom = Phaser.Math.Clamp(Math.floor(Math.min(width / 400, height / 240)), 2, 6);
    this.cameras.main.setZoom(zoom);
    const resolution = zoom * (window.devicePixelRatio || 1);
    for (const label of this.labels) label.setResolution(resolution);
  }

  // ---------------------------------------------------------------- input & state

  private onPausedChange(_parent: unknown, value: unknown) {
    this.setPaused(Boolean(value));
  }

  private setPaused(paused: boolean) {
    const kb = this.input.keyboard!;
    kb.enabled = !paused;
    kb.resetKeys();
    // Release Space/arrows to the page while paused so modal buttons and scrolling work.
    if (paused) kb.disableGlobalCapture();
    else {
      kb.enableGlobalCapture();
      this.resumeAt = this.time.now + RESUME_GRACE_MS;
    }
    this.talkRequested = false;
  }

  private onVirtualInteract() {
    this.talkRequested = true;
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    if (TALK_KEYS.has(key)) this.talkRequested = true;
    else if (key === 'f2') this.debug.setVisible(!this.debug.visible);
  }

  update(time: number, delta: number) {
    if (!this.player) return;

    const view = this.cameras.main.worldView;
    this.snowZone?.setTo(view.x - 20, view.y - 20, view.width + 40, view.height + 20);

    if (this.registry.get(RegistryKey.PAUSED)) {
      this.player.setVelocity(0);
      this.playIdle();
      return;
    }

    this.move(delta);
    this.player.setDepth(this.player.y - 3);
    this.leaveFootprints();
    this.updateNearby();
    this.greetVisitors();
    if (this.nearby) this.bubble.setPosition(this.nearby.x, this.bubbleY(this.nearby) - (Math.floor(time / 400) % 2));

    const talk = this.talkRequested && time >= this.resumeAt;
    this.talkRequested = false;
    if (talk && this.nearby) this.game.events.emit(GameEvent.TALK, { kind: this.nearby.kind, id: this.nearby.id } satisfies SpotRef);
  }

  private bubbleY(spot: Spot) {
    if (spot.kind === 'npc') return spot.y - 38;
    if (spot.kind === 'project') return spot.y - 30;
    if (spot.kind === 'trail') return spot.y - 40;
    return spot.id === 'fox' ? spot.y - 30 : spot.y - 12;
  }

  private move(delta: number) {
    const k = this.keys;
    const stick = (this.registry.get(RegistryKey.VIRTUAL_MOVE) as { x: number; y: number } | undefined) ?? { x: 0, y: 0 };
    let dx: number;
    let dy: number;
    let run: boolean;
    if (stick.x || stick.y) {
      dx = stick.x;
      dy = stick.y;
      run = Math.hypot(dx, dy) > 0.85;
    } else {
      dx = Number(k.D.isDown || k.RIGHT.isDown) - Number(k.A.isDown || k.LEFT.isDown);
      dy = Number(k.S.isDown || k.DOWN.isDown) - Number(k.W.isDown || k.UP.isDown);
      run = k.SHIFT.isDown;
    }

    if (!dx && !dy) {
      this.player.setVelocity(0);
      this.playIdle();
      this.stepTimer = 60; // first step lands just after you start moving
      return;
    }

    const len = Math.hypot(dx, dy);
    const speed = run ? RUN_SPEED : WALK_SPEED;
    this.player.setVelocity((dx / len) * speed, (dy / len) * speed);
    this.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'east' : 'west') : dy > 0 ? 'south' : 'north';
    this.player.play(`north-pole-parka-${run ? 'run' : 'walk'}-${this.facing}`, true);

    this.stepTimer -= delta;
    if (this.stepTimer <= 0) {
      sound.footstep(run);
      this.stepTimer = run ? STEP_MS.run : STEP_MS.walk;
    }
  }

  /** Alternating left/right prints in the snow that slowly fade. */
  private leaveFootprints() {
    const { x, y } = this.player;
    const moved = Math.hypot(x - this.lastPos.x, y - this.lastPos.y);
    this.lastPos = { x, y };
    if (moved === 0 || moved > 20) return; // standing still, or teleported
    this.stride += moved;
    if (this.stride < FOOTPRINT_EVERY) return;
    this.stride = 0;
    this.leftFoot = !this.leftFoot;
    const side = this.leftFoot ? -1 : 1;
    const sideways = this.facing === 'north' || this.facing === 'south';
    const print = this.add
      .image(Math.round(x + (sideways ? side * 2 : 0)), Math.round(y - 2 + (sideways ? 0 : side)), 'footprint')
      .setDepth(DEPTH.footprints)
      .setAlpha(0.9)
      .setAngle(sideways ? 90 : 0);
    this.tweens.add({ targets: print, alpha: 0, delay: FOOTPRINT_FADE_MS / 2, duration: FOOTPRINT_FADE_MS / 2, onComplete: () => print.destroy() });
  }

  private playIdle() {
    // Only the south-facing idle is drawn; other directions hold their first walk frame.
    if (this.facing === 'south') this.player.play(PLAYER_IDLE, true);
    else {
      this.player.anims.stop();
      this.player.setTexture(`north-pole-parka-walk-${this.facing}`, 0);
    }
  }

  private updateNearby() {
    let best: Spot | null = null;
    let bestDist = Infinity;
    for (const s of this.spots) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, s.x, s.y);
      if (d <= s.radius && d < bestDist) {
        best = s;
        bestDist = d;
      }
    }
    if (best === this.nearby) return;
    this.nearby = best;
    this.bubble.setVisible(Boolean(best));
    for (const s of this.spots) {
      s.label?.setVisible(s !== best);
      s.marker?.setVisible(s !== best);
    }
    this.game.events.emit(GameEvent.NEARBY, best ? ({ kind: best.kind, id: best.id } satisfies SpotRef) : null);
  }

  /** The first time you come near a local, they notice you: a "!" and a little hop. */
  private greetVisitors() {
    for (const s of this.spots) {
      if (s.kind !== 'npc' || !s.sprite) continue;
      // The reindeer is drawn facing left; turn it towards the player.
      if (s.id === 'projects') s.sprite.setFlipX(this.player.x > s.x + 4);
      if (s.greeted) continue;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, s.x, s.y) > GREET_RADIUS) continue;
      s.greeted = true;
      sound.blip();
      const mark = this.add.graphics().setDepth(DEPTH.bubbles).setPosition(s.x, s.y - 42);
      mark.fillStyle(INK).fillRect(-2, -8, 5, 12);
      mark.fillStyle(EMBER).fillRect(-1, -7, 3, 6).fillRect(-1, 0, 3, 3);
      if (this.reducedMotion) {
        this.time.delayedCall(1200, () => mark.destroy());
        continue;
      }
      this.tweens.add({ targets: s.sprite, y: s.y - 4, duration: 120, yoyo: true, repeat: 1, ease: 'Quad.out' });
      this.tweens.add({
        targets: mark,
        y: mark.y - 4,
        duration: 160,
        yoyo: true,
        ease: 'Quad.out',
        onComplete: () => this.tweens.add({ targets: mark, alpha: 0, delay: 900, duration: 250, onComplete: () => mark.destroy() }),
      });
    }
  }
}
