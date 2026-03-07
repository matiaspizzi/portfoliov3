import { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroSection } from './components/ui/HeroSection';
import { FloatingMenu } from './components/ui/FloatingMenu';
import { WarpBackground } from './components/3d/WarpBackground';
import { NebulaBackground } from './components/3d/NebulaBackground';
import { GlobeMenu } from './components/3d/GlobeMenu';

const WARP_DURATION_MS = 250;

type AnimationPhase = 'idle' | 'warping' | 'arrived' | 'reverse-warping';

/**
 * Root application component.
 * Manages the warp animation state machine:
 *   idle → warping → arrived → reverse-warping → idle
 */
function App(): React.JSX.Element {
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const contentRef = useRef<HTMLDivElement>(null);

  const isWarping = phase === 'warping' || phase === 'reverse-warping';
  const hasArrived = phase === 'arrived';

  const startSequence = useCallback((): void => {
    if (phase !== 'idle') return;

    setPhase('warping');

    setTimeout(() => {
      setPhase('arrived');
    }, WARP_DURATION_MS);
  }, [phase]);

  const reverseSequence = useCallback((): void => {
    if (phase !== 'arrived') return;

    const scrolledToTop = !contentRef.current || contentRef.current.scrollTop < 10;
    if (!scrolledToTop) return;

    setPhase('reverse-warping');

    setTimeout(() => {
      setPhase('idle');
    }, WARP_DURATION_MS);
  }, [phase]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent): void => {
      if (event.deltaY > 0 && phase === 'idle') {
        startSequence();
      } else if (event.deltaY < 0 && phase === 'arrived') {
        reverseSequence();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [phase, startSequence, reverseSequence]);

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
          <NebulaBackground />
          <WarpBackground
            isWarping={isWarping}
            direction={phase === 'reverse-warping' ? 'backward' : 'forward'}
          />
        </Canvas>
      </div>

      {/* Hero Overlay */}
      <div style={{ pointerEvents: hasArrived ? 'none' : 'auto' }}>
        <HeroSection
          phase={
            phase === 'warping' ? 'warp-out' :
              phase === 'reverse-warping' ? 'warp-in' :
                phase === 'idle' ? 'visible' : 'warp-out'
          }
          onStartWarp={startSequence}
        />
      </div>

      {/* Globe Menu */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <GlobeMenu isVisible={hasArrived} />
      </div>

      {/* Floating Menu */}
      <div style={{ position: 'relative', zIndex: 20 }}>
        <FloatingMenu isVisible={hasArrived} />
      </div>
    </div>
  );
}

export default App;
