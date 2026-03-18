import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FloatingNavContainerProps {
  readonly isVisible: boolean;
  readonly children: ReactNode;
}

const NAV_STYLE: React.CSSProperties = {
  position: 'fixed',
  bottom: '2rem',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 50,
};

const PILL_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem',
  borderRadius: '1rem',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(15,15,15,0.65)',
  backdropFilter: 'blur(24px)',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
};

/**
 * Glassmorphism pill wrapper for the floating navigation bar.
 * Manages the slide-up entrance / exit animation and pointer-events.
 */
export function FloatingNavContainer({ isVisible, children }: FloatingNavContainerProps): React.JSX.Element {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 60 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 60,
      }}
      transition={{ duration: 0.8, delay: isVisible ? 0.3 : 0, ease: 'easeOut' }}
      style={{ ...NAV_STYLE, pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <div style={PILL_STYLE}>
        {children}
      </div>
    </motion.nav>
  );
}
