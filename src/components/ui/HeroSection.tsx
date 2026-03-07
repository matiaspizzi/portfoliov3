import { useEffect, useState } from 'react';

type HeroPhase = 'visible' | 'warp-out' | 'warp-in';

interface HeroSectionProps {
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

/**
 * Full-screen overlay displaying the developer's name and title.
 * Uses CSS transitions for zoom effects that match star warp direction:
 * - warp-out: zooms forward past the viewer (scale up)
 * - warp-in: starts scaled up (behind), then zooms forward to visible
 */
export function HeroSection({
  phase,
  onStartWarp,
}: HeroSectionProps): React.JSX.Element {
  const [style, setStyle] = useState<React.CSSProperties>(PHASE_STYLES.visible);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (phase === 'warp-out') {
      setTransitioning(true);
      setStyle(PHASE_STYLES['warp-out']);
    } else if (phase === 'warp-in') {
      // Jump instantly to "behind" position (no transition)
      setTransitioning(false);
      setStyle({
        transform: 'scale(4)',
        opacity: 0,
        filter: 'blur(14px)',
      });

      // Then animate forward to visible on the next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitioning(true);
          setStyle(PHASE_STYLES.visible);
        });
      });
    } else {
      setTransitioning(true);
      setStyle(PHASE_STYLES.visible);
    }
  }, [phase]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        transition: transitioning ? 'transform 0.25s ease-out, opacity 0.25s ease-out, filter 0.25s ease-out' : 'none',
        ...style,
      }}
    >
      <div style={{ textAlign: 'center', pointerEvents: 'auto' }}>
        <h1
          style={{
            fontFamily: '"Adam", sans-serif',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 'normal',
            letterSpacing: '-0.05em',
            color: '#ffffff',
            marginBottom: '0.5rem',
          }}
        >
          MATIAS{' '}
          <span style={{ color: '#facc15' }}>PIZZI</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
            fontWeight: 300,
            letterSpacing: '0.25em',
            color: '#f3f4f6',
            marginBottom: '3.5rem',
          }}
        >
          FULL STACK DEVELOPER
        </p>

        <button
          onClick={onStartWarp}
          style={{
            cursor: 'pointer',
            borderRadius: '9999px',
            border: '1px solid #facc15',
            padding: '0.75rem 2rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#facc15',
            background: 'transparent',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#facc15';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#facc15';
          }}
        >
          Initiate Sequence
        </button>

      </div>
    </div>
  );
}
