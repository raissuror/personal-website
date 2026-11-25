import React, { useCallback, useRef, useState } from 'react';

const BASE_RADIUS = 56;
const DEAD_ZONE = 0.15;

interface MobileControlsProps {
  /** Joystick direction, each axis -1..1 (0,0 when released). */
  onMove: (x: number, y: number) => void;
  /** TALK button pressed. */
  onInteract: () => void;
}

/** Virtual joystick (bottom-left) and TALK button (bottom-right), overlaid on the canvas. */
export const MobileControls: React.FC<MobileControlsProps> = ({ onMove, onInteract }) => {
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const baseRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<number | null>(null);

  const update = useCallback(
    (clientX: number, clientY: number) => {
      const r = baseRef.current?.getBoundingClientRect();
      if (!r) return;
      let dx = clientX - (r.left + r.width / 2);
      let dy = clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist > BASE_RADIUS) {
        dx = (dx / dist) * BASE_RADIUS;
        dy = (dy / dist) * BASE_RADIUS;
      }
      setStick({ x: dx, y: dy });
      let x = dx / BASE_RADIUS;
      let y = dy / BASE_RADIUS;
      if (Math.abs(x) < DEAD_ZONE) x = 0;
      if (Math.abs(y) < DEAD_ZONE) y = 0;
      onMove(x, y);
    },
    [onMove],
  );

  const release = useCallback(
    (e: React.PointerEvent) => {
      if (pointerRef.current !== e.pointerId) return;
      pointerRef.current = null;
      setActive(false);
      setStick({ x: 0, y: 0 });
      onMove(0, 0);
    },
    [onMove],
  );

  return (
    <div className="touch-controls">
      <div
        ref={baseRef}
        className={`joystick ${active ? 'is-active' : ''}`}
        aria-hidden
        onPointerDown={(e) => {
          e.preventDefault();
          if (pointerRef.current !== null) return;
          pointerRef.current = e.pointerId;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          setActive(true);
          update(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (pointerRef.current === e.pointerId) update(e.clientX, e.clientY);
        }}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <div className="joystick-stick" style={{ transform: `translate(${stick.x}px, ${stick.y}px)` }} />
      </div>
      <button
        type="button"
        className="talk-button"
        aria-label="Talk"
        onPointerDown={(e) => {
          e.preventDefault();
          onInteract();
        }}
      >
        TALK
      </button>
    </div>
  );
};
