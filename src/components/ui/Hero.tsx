import { useEffect, useMemo, useRef } from 'react';
import { HeroTitle } from './HeroTitle';
import { WarpButton } from './WarpButton';

type HeroPhase = 'visible' | 'warp-out' | 'warp-in';

interface HeroProps {
  readonly phase: HeroPhase;
  readonly onStartWarp: () => void;
}

const PHASE_STYLES: Record<HeroPhase, React.CSSProperties> = {
  visible: {
    transform: 'scale(1)',
    opacity: 1,
    filter: 'blur(0px)',
  },
  'warp-out': {
    transform: 'scale(4)',
    opacity: 0,
    filter: 'blur(14px)',
  },
  'warp-in': {
    transform: 'scale(4)',
    opacity: 0,
    filter: 'blur(14px)',
  },
};

const TRANSITION_VALUE = 'transform 0.25s ease-out, opacity 0.25s ease-out, filter 0.25s ease-out';

/**
 * Full-screen overlay displaying the developer's name and title.
 * Uses CSS transitions for zoom effects that match star warp direction:
 * - warp-out: zooms forward past the viewer (scale up)
 * - warp-in: starts scaled up (behind), then zooms forward to visible
 */
export function Hero({
  phase,
  onStartWarp,
}: HeroProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Derive style and transition from phase. For all phases except warp-in,
   * this is the final style applied via React. For warp-in, the initial
   * "behind" position is applied here (no transition), and the effect below
   * handles the deferred animation to visible via direct DOM manipulation.
   */
  const { style, transition } = useMemo(() => {
    if (phase === 'warp-in') {
      return { style: PHASE_STYLES['warp-in'], transition: 'none' };
    }

    return { style: PHASE_STYLES[phase], transition: TRANSITION_VALUE };
  }, [phase]);

  /**
   * Handle the warp-in two-frame animation via direct DOM style manipulation.
   * Effects are designed for synchronizing React with external systems (the DOM),
   * so this is the idiomatic approach. No setState calls needed.
   */
  useEffect(() => {
    if (phase !== 'warp-in') {
      return;
    }

    const element = containerRef.current;
    if (!element) {
      return;
    }

    // After two frames the browser has painted the "behind" position.
    // Now enable transition and animate to the visible position.
    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled || !element) {
          return;
        }
        element.style.transition = TRANSITION_VALUE;
        element.style.transform = PHASE_STYLES.visible.transform as string;
        element.style.opacity = String(PHASE_STYLES.visible.opacity);
        element.style.filter = PHASE_STYLES.visible.filter as string;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [phase]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        height: '100vh',
        width: '100vw',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        transition,
        ...style,
      }}
    >
      <div style={{ textAlign: 'center', pointerEvents: 'auto' }}>
        <HeroTitle />
        <WarpButton onClick={onStartWarp}>Continue</WarpButton>
      </div>
    </div>
  );
}
