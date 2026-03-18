/**
 * Displays the developer's name and job title inside the Hero overlay.
 * Pure presentational component — no logic or state.
 */
export function HeroTitle(): React.JSX.Element {
  return (
    <>
      <h1
        style={{
          fontFamily: '"Adam", sans-serif',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 'normal',
          letterSpacing: '-0.05em',
          color: '#ffffff',
          marginBottom: '0.5rem',
        }}
      >
        MATIAS{' '}
        <span style={{ color: '#facc15' }}>PIZZI</span>
      </h1>

      <p
        style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
          fontWeight: 300,
          letterSpacing: '0.25em',
          color: '#f3f4f6',
          marginBottom: '3.5rem',
        }}
      >
        FULL STACK DEVELOPER
      </p>
    </>
  );
}
