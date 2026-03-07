import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroSection } from './components/ui/HeroSection';
import { FloatingMenu } from './components/ui/FloatingMenu';
import { WarpBackground } from './components/3d/WarpBackground';

const WARP_DURATION_MS = 2500;

type AnimationPhase = 'idle' | 'warping' | 'arrived';

/**
 * Root application component.
 * Manages the warp animation state machine (idle → warping → arrived)
 * and renders the 3D starfield background with UI overlays.
 */
function App(): React.JSX.Element {
  const [phase, setPhase] = useState<AnimationPhase>('idle');

  const isWarping = phase === 'warping';
  const hasArrived = phase === 'arrived';

  const startSequence = useCallback((): void => {
    if (phase !== 'idle') return;

    setPhase('warping');

    setTimeout(() => {
      setPhase('arrived');
    }, WARP_DURATION_MS);
  }, [phase]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent): void => {
      if (event.deltaY > 0 && phase === 'idle') {
        startSequence();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [phase, startSequence]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#050505',
        color: '#ffffff',
      }}
    >
      {/* 3D Starfield Canvas */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: false, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor('#050505');
          }}
        >
          <WarpBackground isWarping={isWarping} />
        </Canvas>
      </div>

      {/* Hero Overlay */}
      {!hasArrived && (
        <HeroSection isWarping={isWarping} onStartWarp={startSequence} />
      )}

      {/* Floating Menu */}
      <FloatingMenu isVisible={hasArrived} />

      {/* Content Sections */}
      {hasArrived && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            overflowY: 'auto',
          }}
        >
          <div style={{ paddingTop: '100vh' }}>
            <section
              id="about"
              style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                textAlign: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <h2
                style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: '#facc15',
                  marginBottom: '1.5rem',
                }}
              >
                About Me
              </h2>
              <p
                style={{
                  maxWidth: '42rem',
                  fontSize: '1.125rem',
                  lineHeight: 1.8,
                  color: '#f3f4f6',
                }}
              >
                I am a Full Stack Developer passionate about creating innovative
                and high-performance digital experiences. I specialize in modern
                ecosystems like React, Next.js, Node.js, and building scalable
                architectures.
              </p>
            </section>

            <section
              id="experience"
              style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#facc15' }}>
                Experience
              </h2>
            </section>

            <section
              id="projects"
              style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#facc15' }}>
                Projects
              </h2>
            </section>

            <section
              id="technologies"
              style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#facc15' }}>
                Technologies
              </h2>
            </section>

            <section
              id="certifications"
              style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: '8rem',
              }}
            >
              <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#facc15' }}>
                Certifications
              </h2>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
