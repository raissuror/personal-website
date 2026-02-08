import React, { useCallback, useRef, useState, useEffect } from 'react';

const JOYSTICK_BASE_R = 56;
const JOYSTICK_STICK_R = 24;
const JOYSTICK_DEAD = 0.15;

export interface MobileControlsProps {
  /** Called every frame while joystick is active. x, y in -1..1. */
  onMove: (x: number, y: number) => void;
  /** Called when the user taps the interact button. */
  onInteract: () => void;
  /** Whether to show the controls (e.g. only on touch devices or small screens). */
  visible?: boolean;
  /** 'bar' = strip under the canvas (in flow); 'overlay' = floating at bottom of screen */
  layout?: 'bar' | 'overlay';
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onInteract,
  visible = true,
  layout = 'bar'
}) => {
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const baseRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);

  const getBaseCenter = useCallback(() => {
    const el = baseRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  const clampToCircle = useCallback((dx: number, dy: number, maxR: number) => {
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d <= maxR) return { x: dx, y: dy };
    const k = maxR / d;
    return { x: dx * k, y: dy * k };
  }, []);

  const sendMove = useCallback(
    (dx: number, dy: number) => {
      const r = JOYSTICK_BASE_R;
      let x = dx / r;
      let y = dy / r;
      const len = Math.sqrt(x * x + y * y);
      if (len > 1) {
        x /= len;
        y /= len;
      }
      if (Math.abs(x) < JOYSTICK_DEAD) x = 0;
      if (Math.abs(y) < JOYSTICK_DEAD) y = 0;
      onMove(x, y);
    },
    [onMove]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (pointerIdRef.current != null) return;
      pointerIdRef.current = e.pointerId;
      setActive(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      const center = getBaseCenter();
      const dx = e.clientX - center.x;
      const dy = e.clientY - center.y;
      const { x, y } = clampToCircle(dx, dy, JOYSTICK_BASE_R);
      setStickPos({ x, y });
      sendMove(x, y);
    },
    [getBaseCenter, clampToCircle, sendMove]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      pointerIdRef.current = null;
      setActive(false);
      setStickPos({ x: 0, y: 0 });
      sendMove(0, 0);
    },
    [sendMove]
  );

  const handleInteractDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      onInteract();
    },
    [onInteract]
  );

  if (!visible) return null;

  const isBar = layout === 'bar';
  const baseStyle: React.CSSProperties = {
    width: JOYSTICK_BASE_R * 2,
    height: JOYSTICK_BASE_R * 2,
    borderRadius: '50%',
    backgroundColor: 'rgba(52, 73, 94, 0.75)',
    border: '3px solid rgba(52, 152, 219, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    touchAction: 'none',
    userSelect: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    ...(isBar ? { position: 'relative' as const } : { position: 'absolute' as const })
  };
  const buttonStyle: React.CSSProperties = {
    width: 64,
    height: 64,
    borderRadius: '50%',
    backgroundColor: 'rgba(52, 73, 94, 0.85)',
    border: '3px solid rgba(52, 152, 219, 0.7)',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    touchAction: 'manipulation',
    userSelect: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    fontFamily: "'Press Start 2P', monospace",
    ...(isBar ? { position: 'relative' as const } : { position: 'absolute' as const })
  };

  if (isBar) {
    return (
      <div
        className="mobile-controls mobile-controls--bar"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '12px 16px',
          backgroundColor: 'rgba(44, 62, 80, 0.95)',
          flexShrink: 0,
          touchAction: 'none'
        }}
        aria-hidden
      >
        <div
          ref={baseRef}
          className="joystick-base"
          style={baseStyle}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className="joystick-stick"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: JOYSTICK_STICK_R * 2,
              height: JOYSTICK_STICK_R * 2,
              marginLeft: -JOYSTICK_STICK_R + stickPos.x,
              marginTop: -JOYSTICK_STICK_R + stickPos.y,
              borderRadius: '50%',
              backgroundColor: active ? 'rgba(52, 152, 219, 0.95)' : 'rgba(52, 152, 219, 0.85)',
              border: '2px solid rgba(255,255,255,0.5)',
              pointerEvents: 'none',
              transition: active ? 'none' : 'margin 0.15s ease-out',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          />
        </div>
        <button
          type="button"
          className="interact-button"
          style={buttonStyle}
          onPointerDown={handleInteractDown}
          aria-label="Interact"
        >
          E
        </button>
      </div>
    );
  }

  return (
    <div
      className="mobile-controls"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10
      }}
      aria-hidden
    >
      <div
        ref={baseRef}
        className="joystick-base"
        style={baseStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="joystick-stick"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: JOYSTICK_STICK_R * 2,
            height: JOYSTICK_STICK_R * 2,
            marginLeft: -JOYSTICK_STICK_R + stickPos.x,
            marginTop: -JOYSTICK_STICK_R + stickPos.y,
            borderRadius: '50%',
            backgroundColor: active ? 'rgba(52, 152, 219, 0.95)' : 'rgba(52, 152, 219, 0.85)',
            border: '2px solid rgba(255,255,255,0.5)',
            pointerEvents: 'none',
            transition: active ? 'none' : 'margin 0.15s ease-out',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        />
      </div>
      <button
        type="button"
        className="interact-button"
        style={buttonStyle}
        onPointerDown={handleInteractDown}
        aria-label="Interact"
      >
        E
      </button>
    </div>
  );
};

/** Hook to detect if mobile controls should be shown (touch device or narrow screen). */
export function useShowMobileControls(): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const check = () => {
      setShow(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(max-width: 768px)').matches
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return show;
}
