import { motion } from 'framer-motion';

interface HeroSectionProps {
  readonly isWarping: boolean;
  readonly onStartWarp: () => void;
}

/**
 * Full-screen overlay displaying the developer's name and title.
 * Fades out smoothly when the warp sequence begins.
 */
export function HeroSection({
  isWarping,
  onStartWarp,
}: HeroSectionProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        opacity: isWarping ? 0 : 1,
        scale: isWarping ? 0.85 : 1,
        y: isWarping ? -60 : 0,
      }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ textAlign: 'center', pointerEvents: 'auto' }}>
        <h1
          style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 'bold',
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

        {!isWarping && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
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
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
