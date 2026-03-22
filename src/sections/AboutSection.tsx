import { Canvas } from '@react-three/fiber';
import { ScorpioSky } from '../components/3d/ScorpioSky';
import { IntroBlock } from '../components/about/IntroBlock';
import { MusicMarquee } from '../components/about/MusicMarquee';
import { RecentTracks } from '../components/about/RecentTracks';
import { PhotoGrid } from '../components/about/PhotoGrid';
import { useTopAlbums } from '../hooks/useTopAlbums';
import { useRecentTracks } from '../hooks/useRecentTracks';

const LASTFM_USER = import.meta.env.VITE_LASTFM_USER as string || 'matiaspizzi';

export function AboutSection() {
  const { albums, isLoading: albumsLoading, error: albumsError } = useTopAlbums(LASTFM_USER, 20);
  const { tracks, isLoading: tracksLoading, error: tracksError, refresh } = useRecentTracks(LASTFM_USER, 10);

  return (
    <div className="relative w-full min-h-screen">
      {/* 3D Starry sky with Scorpio constellation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 7], fov: 60 }} gl={{ alpha: true }}>
          <ScorpioSky />
        </Canvas>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col max-w-5xl mx-auto px-6">
        <IntroBlock />
        <div className="min-h-screen flex flex-col justify-center gap-12">
          <RecentTracks tracks={tracks} isLoading={tracksLoading} error={tracksError} onRefresh={refresh} />
          <MusicMarquee albums={albums} isLoading={albumsLoading} error={albumsError} />
        </div>
        <div className="flex flex-col gap-24 md:gap-32 py-24 md:py-32">
          <PhotoGrid />
        </div>
      </div>
    </div>
  );
}
