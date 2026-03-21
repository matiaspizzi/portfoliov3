import { useState, useCallback, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { Canvas } from '@react-three/fiber';
import { HeroSection } from './sections/HeroSection';
import { WarpBackground } from './components/background/WarpBackground';
import { NebulaBackground } from './components/background/NebulaBackground';
import { NavBar } from './components/navigation/NavBar';
import { MobileNavBar } from './components/navigation/MobileNavBar';
import { SectionObserver } from './components/shared/SectionObserver';
import { AboutSection } from './sections/AboutSection';
import { ContactSection } from './sections/ContactSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { type SectionId } from './store/useSectionStore';

const WARP_DURATION_MS = 250;
type AnimationPhase = 'idle' | 'warping' | 'arrived' | 'reverse-warping';

const SECTIONS_COMPONENTS = [
  { id: 'about', component: <AboutSection /> },
  { id: 'experience', component: <ExperienceSection /> },
  { id: 'projects', component: <ProjectsSection /> },
  { id: 'contact', component: <ContactSection /> },
] as const;

export default function App(): React.JSX.Element {
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const contentRef = useRef<HTMLDivElement>(null);
  const isWarping = phase === 'warping' || phase === 'reverse-warping';

  const startSequence = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('warping');
    setTimeout(() => setPhase('arrived'), WARP_DURATION_MS);
  }, [phase]);

  const reverseSequence = useCallback(() => {
    if (phase !== 'arrived') return;
    if (contentRef.current && contentRef.current.scrollTop > 10) return;
    setPhase('reverse-warping');
    setTimeout(() => setPhase('idle'), WARP_DURATION_MS);
  }, [phase]);

  const scrollToSection = (id: SectionId) => {
    const element = document.getElementById(id);
    if (element && lenisRef.current) {
      lenisRef.current.scrollTo(element);
    } else if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const lenisRef = useRef<Lenis | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== 'arrived' || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: contentRef.current,
      content: contentRef.current,
      lerp: 0.08,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [phase]);

  useEffect(() => {
    const SWIPE_THRESHOLD_PX = 30;

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0 && phase === 'idle') startSequence();
      else if (event.deltaY < 0 && phase === 'arrived') reverseSequence();
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchStartYRef.current === null) return;
      const deltaY = touchStartYRef.current - (event.changedTouches[0]?.clientY ?? 0);
      touchStartYRef.current = null;

      if (deltaY > SWIPE_THRESHOLD_PX && phase === 'idle') {
        // Swiped up (finger moved upward) → scroll down intent → forward warp
        startSequence();
      } else if (deltaY < -SWIPE_THRESHOLD_PX && phase === 'arrived') {
        // Swiped down (finger moved downward) → scroll up intent → reverse warp
        reverseSequence();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [phase, startSequence, reverseSequence]);

  return (
    <div className='w-screen h-screen bg-background text-white relative overflow-hidden'>
      <div className='fixed inset-0 z-0'>
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <NebulaBackground />
          <WarpBackground isWarping={isWarping} direction={phase === 'reverse-warping' ? 'backward' : 'forward'} />
        </Canvas>
      </div>

      {phase !== 'arrived' && <HeroSection phase={phase} onStartWarp={startSequence} />}

      {phase === 'arrived' && (
        <div className="flex flex-col h-screen">
          <NavBar onNavigate={scrollToSection} />
          <MobileNavBar onNavigate={scrollToSection} />
          <div ref={contentRef} className='relative z-10 flex-1 overflow-y-auto h-screen'>
            {SECTIONS_COMPONENTS.map(({ id, component }) => (
              <SectionObserver key={id} id={id}>
                {component}
              </SectionObserver>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}