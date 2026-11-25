import { useCallback, useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { WorldScene } from '../game/WorldScene';
import { GameEvent, RegistryKey } from '../game/bridge';
import { NPCS, type NpcId } from '../game/npcs';
import { loadWorld } from '../game/world';
import { MobileControls } from './MobileControls';
import { useTouchControls } from '../hooks/useTouchControls';

interface GameCanvasProps {
  /** Called when the player talks to an NPC. */
  onTalk: (id: NpcId) => void;
  /** Freeze the game and release the keyboard (e.g. while a modal is open). */
  paused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onTalk, paused }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const onTalkRef = useRef(onTalk);
  const pausedRef = useRef(paused);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [nearby, setNearby] = useState<NpcId | null>(null);
  const touch = useTouchControls();

  useEffect(() => {
    onTalkRef.current = onTalk;
  }, [onTalk]);

  useEffect(() => {
    pausedRef.current = paused;
    gameRef.current?.registry.set(RegistryKey.PAUSED, paused);
  }, [paused]);

  useEffect(() => {
    const parent = canvasRef.current;
    if (!parent) return;
    let cancelled = false;
    let game: Phaser.Game | null = null;

    loadWorld()
      .then((world) => {
        if (cancelled) return;
        game = new Phaser.Game({
          type: Phaser.AUTO,
          parent,
          backgroundColor: '#3c6072',
          pixelArt: true,
          roundPixels: true,
          audio: { noAudio: true },
          physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
          scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth, height: parent.clientHeight },
        });
        game.registry.set(RegistryKey.WORLD, world);
        game.registry.set(RegistryKey.PAUSED, pausedRef.current);
        game.events.on(GameEvent.READY, () => setStatus('ready'));
        game.events.on(GameEvent.NEARBY, (id: NpcId | null) => setNearby(id));
        game.events.on(GameEvent.TALK, (id: NpcId) => onTalkRef.current(id));
        game.scene.add('World', WorldScene, true);
        gameRef.current = game;
      })
      .catch((error) => {
        console.error('Failed to load the world', error);
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      game?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const handleMobileMove = useCallback((x: number, y: number) => {
    gameRef.current?.registry.set(RegistryKey.VIRTUAL_MOVE, { x, y });
  }, []);

  const handleMobileInteract = useCallback(() => {
    gameRef.current?.events.emit(GameEvent.VIRTUAL_INTERACT);
  }, []);

  const npc = nearby ? NPCS[nearby] : null;

  return (
    <div className="game-container relative">
      <div ref={canvasRef} className="game-canvas" />

      {status !== 'ready' && (
        <div className="game-status" role="status">
          {status === 'loading' ? (
            <>
              <span className="game-status-flake glyph" aria-hidden>❄</span>
              Preparing the outpost…
            </>
          ) : (
            'Could not load the world. Please refresh.'
          )}
        </div>
      )}

      {npc && !paused && (
        <div className="talk-prompt px-panel" role="status">
          {touch ? <span className="key">TALK</span> : <span className="key">E</span>}
          <span>
            Talk to <strong>{npc.name}</strong> <span className="talk-prompt-section">· {npc.section}</span>
          </span>
        </div>
      )}

      {touch && status === 'ready' && <MobileControls onMove={handleMobileMove} onInteract={handleMobileInteract} />}
    </div>
  );
};
