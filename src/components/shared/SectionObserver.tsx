import { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { useSectionStore, type SectionId } from '../../store/useSectionStore';

interface SectionObserverProps {
  id: Exclude<SectionId, 'hero'>;
  children: React.ReactNode;
}

export const SectionObserver = ({ id, children }: SectionObserverProps) => {
  const setCurrentSection = useSectionStore((state) => state.setCurrentSection);
  const sectionRef = useRef<HTMLElement>(null);

  const isInView = useInView(sectionRef, {
    amount: 0.1,
    margin: "-10% 0px -45% 0px"
  });

  useEffect(() => {
    if (isInView) {
      setCurrentSection(id);
    }
  }, [isInView, id, setCurrentSection]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="min-h-screen w-full relative flex items-center justify-center"
    >
      {children}
    </section>
  );
};
