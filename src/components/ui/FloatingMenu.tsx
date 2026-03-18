import { User, Briefcase, Award, Code2, Cpu } from 'lucide-react';
import { FloatingNavContainer } from './FloatingNavContainer';
import { FloatingNavItem } from './FloatingNavItem';

const NAV_LINKS = [
  { name: 'About',      icon: User,     href: '#about' },
  { name: 'Experience', icon: Briefcase, href: '#experience' },
  { name: 'Projects',   icon: Code2,    href: '#projects' },
  { name: 'Tech',       icon: Cpu,      href: '#technologies' },
  { name: 'Certs',      icon: Award,    href: '#certifications' },
] as const;

interface FloatingMenuProps {
  readonly isVisible: boolean;
}

/**
 * Glassmorphism floating navigation bar.
 * Slides up from the bottom of the viewport after the warp sequence finishes.
 */
export function FloatingMenu({ isVisible }: FloatingMenuProps): React.JSX.Element {
  return (
    <FloatingNavContainer isVisible={isVisible}>
      {NAV_LINKS.map(({ name, icon, href }) => (
        <FloatingNavItem key={name} name={name} icon={icon} href={href} />
      ))}
    </FloatingNavContainer>
  );
}
