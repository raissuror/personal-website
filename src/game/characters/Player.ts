import Phaser from 'phaser';
import { GAME_CONFIG } from '../../utils/gameConstants';

export class Player {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private lastDirection: 'up' | 'down' | 'left' | 'right' = 'down';
  private speed: number = GAME_CONFIG.PLAYER.SPEED;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'player_down');
    this.sprite.setDisplaySize(GAME_CONFIG.PLAYER.DISPLAY_WIDTH, GAME_CONFIG.PLAYER.DISPLAY_HEIGHT);
    this.sprite.setDepth(5); // Player depth: between Buildings_Low (4) and Roofs (6)
    
    // Set smaller hitbox to match actual character size
    if (this.sprite.body) {
      this.sprite.body.setSize(GAME_CONFIG.PLAYER.HITBOX_WIDTH, GAME_CONFIG.PLAYER.HITBOX_HEIGHT);
      this.sprite.body.setOffset(GAME_CONFIG.PLAYER.HITBOX_OFFSET_X, GAME_CONFIG.PLAYER.HITBOX_OFFSET_Y);
      
      // Enable debug visualization for hitbox
      if (GAME_CONFIG.DEBUG.SHOW_PLAYER_HITBOX) {
        this.sprite.body.debugShowBody = true;
      }
    }
    
    // Add visual border to show the sprite frame boundaries
    if (GAME_CONFIG.DEBUG.SHOW_SPRITE_FRAME_BORDER) {
      this.addSpriteFrameBorder();
    }
    
    this.setupAnimations();
  }

  private setupAnimations() {
    // Create player animations using the 4-frame PNG sprites
    // Each direction has 4 frames: idle, step1, step2, step3
    
    // Down direction animations
    this.scene.anims.create({ 
      key: 'idle-down', 
      frames: [{ key: 'player_down', frame: 0 }], 
      frameRate: GAME_CONFIG.PLAYER.IDLE_FRAME_RATE 
    });
    this.scene.anims.create({ 
      key: 'walk-down', 
      frames: this.scene.anims.generateFrameNumbers('player_down', { start: 0, end: 3 }), 
      frameRate: GAME_CONFIG.PLAYER.WALK_FRAME_RATE, 
      repeat: -1 
    });

    // Left direction animations
    this.scene.anims.create({ 
      key: 'idle-left', 
      frames: [{ key: 'player_left', frame: 0 }], 
      frameRate: GAME_CONFIG.PLAYER.IDLE_FRAME_RATE 
    });
    this.scene.anims.create({ 
      key: 'walk-left', 
      frames: this.scene.anims.generateFrameNumbers('player_left', { start: 0, end: 3 }), 
      frameRate: GAME_CONFIG.PLAYER.WALK_FRAME_RATE, 
      repeat: -1 
    });

    // Right direction animations
    this.scene.anims.create({ 
      key: 'idle-right', 
      frames: [{ key: 'player_right', frame: 0 }], 
      frameRate: GAME_CONFIG.PLAYER.IDLE_FRAME_RATE 
    });
    this.scene.anims.create({ 
      key: 'walk-right', 
      frames: this.scene.anims.generateFrameNumbers('player_right', { start: 0, end: 3 }), 
      frameRate: GAME_CONFIG.PLAYER.WALK_FRAME_RATE, 
      repeat: -1 
    });

    // Up direction animations
    this.scene.anims.create({ 
      key: 'idle-up', 
      frames: [{ key: 'player_up', frame: 0 }], 
      frameRate: GAME_CONFIG.PLAYER.IDLE_FRAME_RATE 
    });
    this.scene.anims.create({ 
      key: 'walk-up', 
      frames: this.scene.anims.generateFrameNumbers('player_up', { start: 0, end: 3 }), 
      frameRate: GAME_CONFIG.PLAYER.WALK_FRAME_RATE, 
      repeat: -1 
    });
  }

  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  /** Update movement from precomputed velocity (keyboard or mobile joystick). */
  public updateWithVelocity(velocityX: number, velocityY: number) {
    this.sprite.setVelocity(velocityX, velocityY);
    this.updateAnimation(velocityX, velocityY);
  }

  public update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasdKeys: any) {
    let velocityX = 0;
    let velocityY = 0;
    if (cursors.left.isDown || wasdKeys.left.isDown) velocityX = -this.speed;
    else if (cursors.right.isDown || wasdKeys.right.isDown) velocityX = this.speed;
    if (cursors.up.isDown || wasdKeys.up.isDown) velocityY = -this.speed;
    else if (cursors.down.isDown || wasdKeys.down.isDown) velocityY = this.speed;
    this.sprite.setVelocity(velocityX, velocityY);
    this.updateAnimation(velocityX, velocityY);
  }

  private updateAnimation(velocityX: number, velocityY: number) {
    if (velocityX === 0 && velocityY === 0) {
      // No movement, play idle animation
      this.sprite.anims.play(`idle-${this.lastDirection}`, true);
    } else {
      // Moving, play walking animation
      if (Math.abs(velocityY) > Math.abs(velocityX)) {
        // Vertical movement is dominant
        if (velocityY > 0) {
          this.sprite.anims.play('walk-down', true);
          this.lastDirection = 'down';
        } else {
          this.sprite.anims.play('walk-up', true);
          this.lastDirection = 'up';
        }
      } else {
        // Horizontal movement is dominant
        if (velocityX > 0) {
          this.sprite.anims.play('walk-right', true);
          this.lastDirection = 'right';
        } else {
          this.sprite.anims.play('walk-left', true);
          this.lastDirection = 'left';
        }
      }
    }
  }

  public getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  public setCollideWorldBounds(value: boolean) {
    this.sprite.setCollideWorldBounds(value);
  }

  private addSpriteFrameBorder() {
    // Create a visual border to show the sprite frame boundaries
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(
      GAME_CONFIG.DEBUG.SPRITE_FRAME_BORDER_WIDTH, 
      GAME_CONFIG.DEBUG.SPRITE_FRAME_BORDER_COLOR, 
      1
    );
    graphics.strokeRect(
      this.sprite.x - this.sprite.displayWidth / 2,
      this.sprite.y - this.sprite.displayHeight / 2,
      this.sprite.displayWidth,
      this.sprite.displayHeight
    );
    graphics.setDepth(2); // Above the sprite
  }
} 