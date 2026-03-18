import { motion } from 'framer-motion';
import type { SeparatorStatus } from './NavSeparator';

interface NavButtonProps {
  readonly label: string;
  /** Visual state relative to the currently active section. */
  readonly status: SeparatorStatus;
  /** Framer-motion stagger delay in seconds. */
  readonly animationDelay: number;
  readonly onClick: () => void;
}

const STATUS_CLASS: Record<SeparatorStatus, string> = {
  active: 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]',
  past:   'text-white/50 hover:text-white/80',
  future: 'text-white/30 hover:text-white/40',
};

/**
 * Individual navigation button used inside NavBar.
 * Animates in from above and reflects the current section status via colour.
 */
export function NavButton({ label, status, animationDelay, onClick }: NavButtonProps): React.JSX.Element {
  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      onClick={onClick}
      className={`text-sm font-medium tracking-widest uppercase cursor-pointer transition-all duration-400 outline-none ${STATUS_CLASS[status]}`}
    >
      {label}
    </motion.button>
  );
}
