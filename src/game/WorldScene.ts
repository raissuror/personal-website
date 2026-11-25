import Phaser from 'phaser';
import { GameEvent, RegistryKey } from './bridge';
import { NPCS, isNpcId, type NpcId } from './npcs';
import { objectsIn, type WorldData } from './world';

const WALK_SPEED = 66;
const RUN_SPEED = 104;
/** Max distance (px) between the player's feet and an NPC's feet to talk. */
const TALK_RADIUS = 28;
/** Ignore talk input briefly after a modal closes, so the closing key press doesn't reopen it. */
const RESUME_GRACE_MS = 250;
const PLAYER_IDLE = 'north-pole-parka-idle-south';

const GID_MASK = 0x1fffffff;
const FLIP_H = 0x80000000;
const FLIP_V = 0x40000000;

type Facing = 'north' | 'south' | 'east' | 'west';
type Keys = Record<'W' | 'A' | 'S' | 'D' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'SHIFT' | 'E' | 'SPACE' | 'ENTER' | 'F2', Phaser.Input.Keyboard.Key>;

const TALK_KEYS = new Set(['e', ' ', 'enter']);

interface Npc {
  id: NpcId;
  x: number;
  y: number;
  label: Phaser.GameObjects.Text;
}

export class WorldScene extends Phaser.Scene {
  private world!: WorldData;
  private player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Keys;
  private npcs: Npc[] = [];
  private nearby: Npc | null = null;
  private bubble!: Phaser.GameObjects.Graphics;
  private debug!: Phaser.GameObjects.Graphics;
  private facing: Facing = 'south';
  /** Set by a talk key / TALK button; consumed on the next update. */
  private talkRequested = false;
  private resumeAt = 0;

  constructor() {
    super('World');
  }

  init() {
    this.world = this.registry.get(RegistryKey.WORLD);
    this.npcs = [];
    this.nearby = null;
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

    this.createAnimations();
    this.createGround();
    this.createScenery();
    const solids = this.createSolids();
    this.createNpcs(solids);
    this.createPlayer(solids);
    this.createBubble();

    this.physics.world.setBounds(0, 0, widthPx, heightPx);
    this.cameras.main
      .setBounds(0, 0, widthPx, heightPx)
      .setRoundPixels(true)
      .startFollow(this.player, true, 0.12, 0.12);
    this.fitCamera();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.fitCamera, this);

    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,E,SPACE,ENTER,F2') as Keys;
    // Use keydown events, not JustDown polling: a tap whose down+up land in the same frame
    // clears JustDown before update() sees it, so quick presses would be silently dropped.
    this.input.keyboard!.on('keydown', this.onKeyDown, this);
    this.setPaused(Boolean(this.registry.get(RegistryKey.PAUSED)));
    this.registry.events.on(`changedata-${RegistryKey.PAUSED}`, this.onPausedChange, this);
    this.game.events.on(GameEvent.VIRTUAL_INTERACT, this.onVirtualInteract, this);

    // F2 shows collision boxes and talk radii — handy after editing the map in Tiled.
    this.debug = this.add.graphics().setDepth(100000).setVisible(false);
    this.debug.lineStyle(1, 0xe87864, 0.9);
    for (const o of objectsIn(map, 'Collision')) this.debug.strokeRect(o.x, o.y, o.width, o.height);
    this.debug.lineStyle(1, 0xf2cc85, 0.9);
    for (const n of this.npcs) this.debug.strokeCircle(n.x, n.y, TALK_RADIUS);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.fitCamera, this);
      this.registry.events.off(`changedata-${RegistryKey.PAUSED}`, this.onPausedChange, this);
      this.game.events.off(GameEvent.VIRTUAL_INTERACT, this.onVirtualInteract, this);
    });

    this.game.events.emit(GameEvent.READY);
  }

  // ---------------------------------------------------------------- world building

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
      tilemap.createLayer(l.name, sets)?.setVisible(l.visible !== false).setAlpha(l.opacity ?? 1).setDepth(-1000);
    }
  }

  private createScenery() {
    const layer = this.world.map.layers.find((l) => l.name === 'Scenery');
    if (!layer || layer.visible === false) return;
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
      if (typeof animation === 'string' && this.anims.exists(animation)) sprite.play(animation);
    }
  }

  private createSolids() {
    const solids = this.physics.add.staticGroup();
    for (const o of objectsIn(this.world.map, 'Collision')) {
      const zone = this.add.zone(o.x + o.width / 2, o.y + o.height / 2, o.width, o.height);
      solids.add(zone);
    }
    return solids;
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

      const label = this.add
        .text(o.x, o.y - 30, info.section.toUpperCase(), {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '4px',
          color: '#f7f7ef',
          backgroundColor: '#1d3340',
          padding: { x: 2, y: 2 },
        })
        .setOrigin(0.5, 1)
        .setDepth(99000);

      this.npcs.push({ id: o.name, x: o.x, y: o.y, label });
    }
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
  }

  /** "…" speech bubble shown above the NPC you can talk to. */
  private createBubble() {
    const g = this.add.graphics().setDepth(99500).setVisible(false);
    g.fillStyle(0x1d3340).fillRect(-6, -6, 13, 9).fillRect(-1, 3, 3, 2);
    g.fillStyle(0xf7f7ef).fillRect(-5, -5, 11, 7).fillRect(0, 2, 1, 2);
    g.fillStyle(0x1d3340).fillRect(-3, -2, 1, 1).fillRect(0, -2, 1, 1).fillRect(3, -2, 1, 1);
    this.bubble = g;
  }

  private fitCamera() {
    const { width, height } = this.scale.gameSize;
    // Integer zoom keeps pixels crisp; aim for at least ~400×240 world pixels on screen.
    const zoom = Phaser.Math.Clamp(Math.floor(Math.min(width / 400, height / 240)), 2, 6);
    this.cameras.main.setZoom(zoom);
    const resolution = zoom * (window.devicePixelRatio || 1);
    for (const n of this.npcs) n.label.setResolution(resolution);
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

  update(time: number) {
    if (!this.player) return;

    if (this.registry.get(RegistryKey.PAUSED)) {
      this.player.setVelocity(0);
      this.playIdle();
      return;
    }

    this.move();
    this.player.setDepth(this.player.y - 3);
    this.updateNearby();
    if (this.nearby) this.bubble.setPosition(this.nearby.x, this.nearby.y - 38 - (Math.floor(time / 400) % 2));

    const talk = this.talkRequested && time >= this.resumeAt;
    this.talkRequested = false;
    if (talk && this.nearby) this.game.events.emit(GameEvent.TALK, this.nearby.id);
  }

  private move() {
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
      return;
    }

    const len = Math.hypot(dx, dy);
    const speed = run ? RUN_SPEED : WALK_SPEED;
    this.player.setVelocity((dx / len) * speed, (dy / len) * speed);
    this.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'east' : 'west') : dy > 0 ? 'south' : 'north';
    this.player.play(`north-pole-parka-${run ? 'run' : 'walk'}-${this.facing}`, true);
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
    let best: Npc | null = null;
    let bestDist = TALK_RADIUS;
    for (const n of this.npcs) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y);
      if (d <= bestDist) {
        best = n;
        bestDist = d;
      }
    }
    if (best === this.nearby) return;
    this.nearby = best;
    this.bubble.setVisible(Boolean(best));
    for (const n of this.npcs) n.label.setVisible(n !== best);
    this.game.events.emit(GameEvent.NEARBY, best?.id ?? null);
  }
}
