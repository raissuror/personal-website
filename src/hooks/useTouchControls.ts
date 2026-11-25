import { useEffect, useState } from 'react';

const detect = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(max-width: 768px)').matches);

/** True on touch devices or narrow screens, where we show the joystick and TALK button. */
export function useTouchControls(): boolean {
  const [touch, setTouch] = useState(detect);
  useEffect(() => {
    const update = () => setTouch(detect());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return touch;
}
