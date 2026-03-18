import { motion } from 'framer-motion';

export type SeparatorStatus = 'past' | 'active' | 'future';

interface NavSeparatorProps {
  readonly status: SeparatorStatus;
}

/**
 * Horizontal rule between NavBar items.
 * Brightens when its preceding section is active or past.
 */
export function NavSeparator({ status }: NavSeparatorProps): React.JSX.Element {
  const isHighlighted = status === 'active' || status === 'past';

  return (
    <motion.div
      initial={false}
      className={`w-14 h-px transition-all duration-400 ${
        isHighlighted
          ? 'bg-white/60 scale-x-105 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
          : 'bg-white/10'
      }`}
    />
  );
}
