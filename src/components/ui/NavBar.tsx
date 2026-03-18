import React from 'react';
import { motion } from 'framer-motion';
import { useSectionStore, SECTIONS, type SectionId } from '../../store/useSectionStore';
import { NavButton } from './NavButton';
import { NavSeparator } from './NavSeparator';
import type { SeparatorStatus } from './NavSeparator';

interface NavBarProps {
  onNavigate: (id: SectionId) => void;
}

/**
 * Sticky top navigation bar rendered after the warp sequence completes.
 * Maps each section to a NavButton + NavSeparator pair reflecting the
 * visitor's current position in the page.
 */
export function NavBar({ onNavigate }: NavBarProps) {
  const currentSection = useSectionStore((state) => state.currentSection);

  const navSections = SECTIONS.filter(s => s !== 'hero');
  const currentIndex = navSections.indexOf(currentSection as "about" | "experience" | "projects" | "contact");

  const getSeparatorStatus = (index: number): SeparatorStatus => {
    if (index < currentIndex) return 'past';
    if (index === currentIndex) return 'active';
    return 'future';
  };

  const getButtonStatus = (index: number): SeparatorStatus => {
    if (index < currentIndex) return 'past';
    if (index === currentIndex) return 'active';
    return 'future';
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.1
      }}
      className="hidden md:flex sticky top-0 z-200 bg-black/20 backdrop-blur-2xl min-w-full h-16 items-center justify-center gap-6 border-b border-white/5 px-8"
    >
      {navSections.map((section, index) => (
        <React.Fragment key={section}>
          <NavButton
            label={section}
            status={getButtonStatus(index)}
            animationDelay={0.2 + index * 0.1}
            onClick={() => onNavigate(section as SectionId)}
          />

          {index !== navSections.length - 1 && (
            <NavSeparator status={getSeparatorStatus(index)} />
          )}
        </React.Fragment>
      ))}
    </motion.nav>
  );
}