import type { SpotRef } from '../game/bridge';
import { NPCS, isNpcId } from '../game/npcs';
import { CAREER } from './career';
import { projectById } from './projects';

/** Words for the "Talk to …" prompt shown when you're next to something. */
export function describeSpot({ kind, id }: SpotRef): { verb: string; name: string; detail: string } {
  if (kind === 'npc' && isNpcId(id)) return { verb: 'Talk to', name: NPCS[id].name, detail: NPCS[id].section };
  if (kind === 'project') return { verb: 'Look at', name: projectById(id)?.title ?? id, detail: 'Project' };
  if (kind === 'trail') {
    const stop = CAREER[Number(id)];
    return { verb: 'Read the sign', name: stop?.when ?? '', detail: stop?.role ?? '' };
  }
  return { verb: 'Check out', name: 'something odd', detail: 'Secret' };
}
