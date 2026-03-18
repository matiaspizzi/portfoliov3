import { motion } from 'framer-motion';
import { User, Briefcase, Code2, Mail } from 'lucide-react';
import { useSectionStore, type SectionId } from '../../store/useSectionStore';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  readonly id: SectionId;
  readonly icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'about',      icon: User },
  { id: 'experience', icon: Briefcase },
  { id: 'projects',   icon: Code2 },
  { id: 'contact',    icon: Mail },
];

interface MobileNavBarProps {
  readonly onNavigate: (id: SectionId) => void;
}

/**
 * Fixed bottom navigation bar for mobile viewports.
 * Shows icon-only buttons that highlight when the corresponding section is active.
 * Hidden on md+ breakpoints where the desktop NavBar takes over.
 */
export function MobileNavBar({ onNavigate }: MobileNavBarProps): React.JSX.Element {
  const currentSection = useSectionStore((state) => state.currentSection);

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around
                 h-16 bg-black/40 backdrop-blur-2xl border-t border-white/5 px-4"
    >
      {NAV_ITEMS.map(({ id, icon: Icon }) => {
        const isActive = currentSection === id;

        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 outline-none ${
              isActive
                ? 'text-white bg-white/10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            <Icon size={22} />
          </button>
        );
      })}
    </motion.nav>
  );
}
