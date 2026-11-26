import type { CSSProperties } from 'react';
import { NPCS, npcPortraitUrl, spriteUrl, type NpcId } from '../game/npcs';

type Source =
  | { id: NpcId; sprite?: never; label?: never }
  /** Any 4-frame 32×32 strip in public/assets/world/sprites, by file name without .png. */
  | { sprite: string; label: string; id?: never };

type NpcPortraitProps = Source & {
  /** Rendered size in px; use a multiple of 32 to keep pixels crisp. */
  size?: 32 | 64 | 96;
  animated?: boolean;
  className?: string;
  /** Decorative portraits (next to the name) should be hidden from screen readers. */
  decorative?: boolean;
};

/** Animated idle frame from a character's 4-frame sprite strip. */
export function NpcPortrait({ id, sprite, label, size = 64, animated = true, className = '', decorative = false }: NpcPortraitProps) {
  const url = id ? npcPortraitUrl(id) : spriteUrl(sprite!);
  const name = id ? NPCS[id].name : label;
  const style = { '--s': `${size}px`, backgroundImage: `url(${url})` } as CSSProperties;
  return (
    <span
      className={`sprite ${animated ? 'sprite--anim' : ''} ${className}`}
      style={style}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': name })}
    />
  );
}
