import { motion } from 'framer-motion';
import { User, Briefcase, Award, Code2, Cpu } from 'lucide-react';

const NAV_LINKS = [
  { name: 'About', icon: User, href: '#about' },
  { name: 'Experience', icon: Briefcase, href: '#experience' },
  { name: 'Projects', icon: Code2, href: '#projects' },
  { name: 'Tech', icon: Cpu, href: '#technologies' },
  { name: 'Certs', icon: Award, href: '#certifications' },
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
    <motion.nav
      initial={{ opacity: 0, y: 60 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 60,
      }}
      transition={{ duration: 0.8, delay: isVisible ? 0.3 : 0, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(15,15,15,0.65)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        {NAV_LINKS.map(({ name, icon: Icon, href }) => (
          <a
            key={name}
            href={href}
            title={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              color: '#f3f4f6',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#facc15';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#f3f4f6';
            }}
          >
            <Icon style={{ width: '1.25rem', height: '1.25rem', marginBottom: '0.25rem' }} />
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {name}
            </span>
          </a>
        ))}
      </div>
    </motion.nav>
  );
}
