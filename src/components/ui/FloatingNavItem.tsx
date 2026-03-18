import type { LucideIcon } from 'lucide-react';

interface FloatingNavItemProps {
  readonly name: string;
  readonly href: string;
  readonly icon: LucideIcon;
}

const BASE_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.75rem',
  borderRadius: '0.75rem',
  color: '#f3f4f6',
  textDecoration: 'none',
  transition: 'all 0.3s ease',
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.625rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
};

const ICON_STYLE: React.CSSProperties = {
  width: '1.25rem',
  height: '1.25rem',
  marginBottom: '0.25rem',
};

/**
 * Single icon + label anchor inside the FloatingMenu.
 * Hover colours are applied via direct style mutation to avoid
 * per-item state and unnecessary re-renders.
 */
export function FloatingNavItem({ name, href, icon: Icon }: FloatingNavItemProps): React.JSX.Element {
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
    e.currentTarget.style.color = '#facc15';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.color = '#f3f4f6';
  };

  return (
    <a
      href={href}
      title={name}
      style={BASE_STYLE}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Icon style={ICON_STYLE} />
      <span style={LABEL_STYLE}>{name}</span>
    </a>
  );
}
