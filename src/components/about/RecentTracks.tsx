import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Music } from 'lucide-react';
import type { RecentTrack } from '../../types/lastfm';

function TrackImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  if (!src) {
    return (
      <div className={`${className} bg-white/5 flex items-center justify-center`}>
        <Music className="w-1/3 h-1/3 text-white/20" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('fallback-img'); }} />;
}

type RecentTracksProps = {
  tracks: RecentTrack[]
  isLoading: boolean
  isLoadingMore?: boolean
  hasMore?: boolean
  error: string | null
  onRefresh?: () => void
  onLoadMore?: () => void
}

function formatTimeAgo(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NowPlayingCard({ track }: { track: RecentTrack }) {
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-4 group"
    >
      <div className="relative">
        <TrackImage
          src={track.largeImageUrl}
          alt={`${track.name} by ${track.artist}`}
          className="w-52 h-52 object-cover shadow-lg shadow-black/40"
        />
        {track.nowPlaying && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-green-400 animate-pulse rounded-full" style={{ height: '60%', animationDelay: '0ms' }} />
              <span className="w-0.5 bg-green-400 animate-pulse rounded-full" style={{ height: '100%', animationDelay: '150ms' }} />
              <span className="w-0.5 bg-green-400 animate-pulse rounded-full" style={{ height: '40%', animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] text-green-400 uppercase tracking-wider font-medium">Live</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors line-clamp-2">
          {track.name}
        </p>
        <p className="text-xs text-white/40 mt-1">
          {track.artist}
        </p>
        {!track.nowPlaying && track.date && (
          <p className="text-xs text-white/25 mt-1">
            {formatTimeAgo(track.date)}
          </p>
        )}
      </div>
    </a>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="w-10 h-10 bg-white/5 animate-pulse shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
        <div className="h-3 w-20 rounded bg-white/5 animate-pulse mt-1" />
      </div>
    </div>
  );
}

export function RecentTracks({ tracks, isLoading, isLoadingMore, error, onRefresh, onLoadMore }: RecentTracksProps) {
  const [spinning, setSpinning] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const handleListScroll = () => {
    const list = listRef.current;
    if (!list || !onLoadMore) return;
    const { scrollTop, scrollHeight, clientHeight } = list;
    if (scrollHeight - scrollTop - clientHeight < 60) onLoadMore();
  };

  if (error) return null;

  const featured = tracks[0];
  const rest = tracks.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-center gap-3 mb-6">
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight leading-none" style={{ fontFamily: 'Adam, sans-serif' }}>
          Recently Played
        </h3>
        {onRefresh && (
          <button
            onClick={() => {
              setSpinning(true);
              onRefresh();
              setTimeout(() => setSpinning(false), 1000);
            }}
            className="text-white/30 hover:text-white/70 transition-colors translate-y-[3px]"
            title="Refresh"
          >
            <RefreshCw size={16} className={spinning ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col md:flex-row gap-20 items-center">
          <div className="shrink-0 mx-auto md:mx-0">
            <div className="w-52 h-52 bg-white/5 animate-pulse" />
            <div className="mt-4 mx-auto h-3 w-28 bg-white/5 animate-pulse rounded" />
            <div className="mt-2 mx-auto h-3 w-20 bg-white/5 animate-pulse rounded" />
          </div>
          <div className="flex-1 flex flex-col divide-y divide-white/5 min-w-0 max-h-[300px]">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-20 items-center">
          {featured && (
            <div className="shrink-0 mx-auto md:mx-0">
              <NowPlayingCard track={featured} />
            </div>
          )}
          <div ref={listRef} data-lenis-prevent onScroll={handleListScroll} className="flex-1 flex flex-col divide-y divide-white/5 min-w-0 max-h-[300px] overflow-y-auto">
            {rest.map((track, i) => (
              <a
                key={`${track.name}-${i}`}
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors group min-w-[350px]"
              >
                <TrackImage
                  src={track.imageUrl}
                  alt={`${track.name} by ${track.artist}`}
                  className="w-10 h-10 object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 group-hover:text-white truncate font-medium max-w-[250px] md:max-w-none">
                    {track.name}
                  </p>
                  <p className="text-xs text-white/40 truncate max-w-[250px] md:max-w-none">
                    {track.artist}
                  </p>
                </div>
                <span className="text-xs text-white/30 shrink-0">
                  {track.date ? formatTimeAgo(track.date) : ''}
                </span>
              </a>
            ))}
            {isLoadingMore && (
              <div className="flex items-center justify-center px-3 py-3 border-t border-white/5">
                <div className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
