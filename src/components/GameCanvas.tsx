import { useCallback, useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../game/scenes/GameScene';
import { MobileControls, useShowMobileControls } from './MobileControls';

interface GameCanvasProps {
  onInteraction?: (type: string, data: any) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onInteraction }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const interactionCallbackRef = useRef(onInteraction);
  const showMobileControls = useShowMobileControls();

  const handleMobileMove = useCallback((x: number, y: number) => {
    const scene = gameRef.current?.scene?.scenes?.[0] as GameScene | undefined;
    scene?.setVirtualVelocity(x, y);
  }, []);

  const handleMobileInteract = useCallback(() => {
    const scene = gameRef.current?.scene?.scenes?.[0] as GameScene | undefined;
    scene?.triggerVirtualInteract();
  }, []);

  // Update the ref when onInteraction changes
  useEffect(() => {
    interactionCallbackRef.current = onInteraction;
    
    // Update the callback in the existing scene if the game is running
    if (gameRef.current && gameRef.current.scene.scenes[0]) {
      (gameRef.current.scene.scenes[0] as GameScene).setInteractionCallback(onInteraction);
    }
  }, [onInteraction]);


  useEffect(() => {
    if (!canvasRef.current || gameRef.current) {
      return;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: canvasRef.current,
      backgroundColor: '#2c3e50',
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    gameRef.current = new Phaser.Game(config);

    // Pass interaction callback to the scene with a delay to ensure scene is ready
    setTimeout(() => {
      if (gameRef.current && gameRef.current.scene.scenes[0]) {
        (gameRef.current.scene.scenes[0] as GameScene).setInteractionCallback(interactionCallbackRef.current);
      }
    }, 100);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []); // Remove all dependencies to prevent re-creation

  return (
    <div className="game-container relative">
      <div ref={canvasRef} className="game-canvas" />
      <MobileControls
        visible={showMobileControls}
        layout="overlay"
        onMove={handleMobileMove}
        onInteract={handleMobileInteract}
      />
    </div>
  );
}; 