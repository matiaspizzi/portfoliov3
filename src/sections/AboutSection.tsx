import { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ScorpioSky } from '../components/3d/ScorpioSky';
import { IntroBlock } from '../components/about/IntroBlock';
import { MusicMarquee } from '../components/about/MusicMarquee';
import { RecentTracks } from '../components/about/RecentTracks';
import { PhotoGrid } from '../components/about/PhotoGrid';
import { useTopAlbums } from '../hooks/useTopAlbums';
import { useRecentTracks } from '../hooks/useRecentTracks';

const LASTFM_USER = import.meta.env.VITE_LASTFM_USER as string || 'matiaspizzi';

type ActiveSection = 'music' | 'photos' | null;

const slideVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export function AboutSection() {
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const { albums, isLoading: albumsLoading, error: albumsError } = useTopAlbums(LASTFM_USER, 20);
  const { tracks, isLoading: tracksLoading, isLoadingMore, hasMore, error: tracksError, refresh, loadMore } = useRecentTracks(LASTFM_USER, 10);

  const handleToggle = useCallback((section: 'music' | 'photos') => {
    setActiveSection((prev) => (prev === section ? null : section));
  }, []);

  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute top-0 left-0 w-full h-screen z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 7], fov: 60 }} gl={{ alpha: true }}>
          <ScorpioSky />
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col max-w-5xl mx-auto px-6">
        <IntroBlock activeSection={activeSection} onToggle={handleToggle} />

        <AnimatePresence mode="wait">
          {activeSection === 'music' && (
            <motion.div
              key="music"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="relative flex flex-col gap-12 my-12">
                <button onClick={() => setActiveSection(null)} className="absolute top-0 right-0 text-white/60 hover:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
                <RecentTracks tracks={tracks} isLoading={tracksLoading} isLoadingMore={isLoadingMore} hasMore={hasMore} error={tracksError} onRefresh={refresh} onLoadMore={loadMore} />
                <MusicMarquee albums={albums} isLoading={albumsLoading} error={albumsError} />
              </div>
            </motion.div>
          )}

          {activeSection === 'photos' && (
            <motion.div
              key="photos"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="relative py-12">
                <button onClick={() => setActiveSection(null)} className="absolute top-0 right-0 text-white/60 hover:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
                <PhotoGrid />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
