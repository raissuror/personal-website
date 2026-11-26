import { useSyncExternalStore } from 'react';
import { sound } from '../audio/sound';

/** Whether sound is on; re-renders when it's toggled anywhere. */
export function useSoundEnabled() {
  return useSyncExternalStore(sound.subscribe, sound.isEnabled, () => false);
}
