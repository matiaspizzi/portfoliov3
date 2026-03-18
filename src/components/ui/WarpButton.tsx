import type { ReactNode } from 'react';

interface WarpButtonProps {
  readonly onClick: () => void;
  readonly children: ReactNode;
}

const BASE_STYLE: React.CSSProperties = {
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
};

/**
 * CTA pill-button rendered on the Hero screen.
 * Swaps to a solid yellow fill on hover via direct style mutation
 * to avoid React re-renders during the warp animation.
 */
export function WarpButton({ onClick, children }: WarpButtonProps): React.JSX.Element {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#facc15';
    e.currentTarget.style.color = '#000000';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.color = '#facc15';
  };

  return (
    <button
      onClick={onClick}
      style={BASE_STYLE}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}
