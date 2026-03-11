import React from 'react';
import { motion } from 'framer-motion';
import { useSectionStore, SECTIONS, type SectionId } from '../../store/useSectionStore';

interface SeparatorProps {
  status: 'past' | 'active' | 'future';
}

export function Separator({ status }: SeparatorProps) {
  return (
    <motion.div
      initial={false}
      className={`w-14 h-px transition-all duration-400 ${status === 'active' || status === 'past'
        ? "bg-white/60 scale-x-105 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
        : "bg-white/10"
        }`}
    />
  );
}

interface NavBarProps {
  onNavigate: (id: SectionId) => void;
}

export function NavBar({ onNavigate }: NavBarProps) {
  const currentSection = useSectionStore((state) => state.currentSection);

  const navSections = SECTIONS.filter(s => s !== 'hero');
  const currentIndex = navSections.indexOf(currentSection as "about" | "experience" | "projects" | "contact");

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.1
      }}
      className="flex sticky top-0 z-200 bg-black/20 backdrop-blur-2xl min-w-full h-16 items-center justify-center gap-6 border-b border-white/5 px-8"
    >
      {navSections.map((section, index) => {
        const isPast = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <React.Fragment key={section}>
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}

              onClick={() => onNavigate(section as SectionId)}
              className={`text-sm font-medium tracking-widest uppercase cursor-pointer transition-all duration-400 outline-none ${isActive
                ? "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                : isPast
                  ? "text-white/50 hover:text-white/80"
                  : "text-white/30 hover:text-white/40"
                }`}
            >
              {section}
            </motion.button>

            {index !== navSections.length - 1 && (
              <Separator
                status={index < currentIndex ? 'past' : index === currentIndex ? 'active' : 'future'}
              />
            )}
          </React.Fragment>
        );
      })}
    </motion.nav>
  );
}