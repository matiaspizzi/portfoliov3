import { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroSection } from './sections/HeroSection';
import { WarpBackground } from './components/3d/WarpBackground';
import { NebulaBackground } from './components/3d/NebulaBackground';
import { NavBar } from './components/ui/NavBar';
// import { SectionObserver } from './components/SectionObserver';
// import { AboutSection } from './sections/AboutSection';
// import { ContactSection } from './sections/ContactSection';
// import { ExperienceSection } from './sections/ExperienceSection';
// import { ProjectsSection } from './sections/ProjectsSection';
import { type SectionId } from './store/useSectionStore';
import under_construction from './assets/gifs/under_construction.gif';

const WARP_DURATION_MS = 250;
type AnimationPhase = 'idle' | 'warping' | 'arrived' | 'reverse-warping';

// const SECTIONS_COMPONENTS = [
//   { id: 'about', component: <AboutSection /> },
//   { id: 'experience', component: <ExperienceSection /> },
//   { id: 'projects', component: <ProjectsSection /> },
//   { id: 'contact', component: <ContactSection /> },
// ] as const;

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
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0 && phase === 'idle') startSequence();
      else if (event.deltaY < 0 && phase === 'arrived') reverseSequence();
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
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
          <div ref={contentRef} className='relative z-10 flex-1 overflow-y-auto scroll-smooth h-screen'>
            {/* {SECTIONS_COMPONENTS.map(({ id, component }) => (
              <SectionObserver key={id} id={id}>
                {component}
              </SectionObserver>
            ))} */}
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p>Sorry - haven&apos;t had time to finish this, still working on it 😔</p>
              <img src={under_construction} alt="" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}