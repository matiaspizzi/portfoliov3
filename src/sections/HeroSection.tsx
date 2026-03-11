import { Hero } from "../components/ui/Hero";

interface HeroProps {
  phase: string;
  onStartWarp: () => void;
}

export function HeroSection({ phase, onStartWarp }: HeroProps) {
  return (

    <div style={{ pointerEvents: phase === 'arrived' ? 'none' : 'auto' }}>
      <Hero
        phase={
          phase === 'warping' ? 'warp-out' :
            phase === 'reverse-warping' ? 'warp-in' :
              phase === 'idle' ? 'visible' : 'warp-out'
        }
        onStartWarp={onStartWarp}
      />
    </div>

  );
}