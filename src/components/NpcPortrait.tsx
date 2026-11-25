import type { CSSProperties } from 'react';
import { NPCS, npcPortraitUrl, type NpcId } from '../game/npcs';

interface NpcPortraitProps {
  id: NpcId;
  /** Rendered size in px; use a multiple of 32 to keep pixels crisp. */
  size?: 32 | 64 | 96;
  animated?: boolean;
  className?: string;
  /** Decorative portraits (next to the NPC's name) should be hidden from screen readers. */
  decorative?: boolean;
}

/** Animated idle frame from the NPC's 4-frame sprite strip. */
export function NpcPortrait({ id, size = 64, animated = true, className = '', decorative = false }: NpcPortraitProps) {
  const style = { '--s': `${size}px`, backgroundImage: `url(${npcPortraitUrl(id)})` } as CSSProperties;
  return (
    <span
      className={`sprite ${animated ? 'sprite--anim' : ''} ${className}`}
      style={style}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': NPCS[id].name })}
    />
  );
}
