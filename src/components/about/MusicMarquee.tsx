
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import type { Album } from '../../types/lastfm';

type MusicMarqueeProps = {
  albums: Album[]
  isLoading: boolean
  error: string | null
}

function SkeletonCard() {
  return (
    <div className="shrink-0" style={{ minWidth: 160, marginLeft: 5, marginRight: 5 }}>
      <div className="w-full h-40 bg-white/5 animate-pulse" />
      <div className="mt-2 h-3 w-24 mx-auto rounded bg-white/5 animate-pulse" />
    </div>
  );
}

export function MusicMarquee({ albums, isLoading, error }: MusicMarqueeProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: true, align: 'start' },
    [AutoScroll({ speed: 1, stopOnInteraction: true, stopOnMouseEnter: true, startDelay: 0 })]
  );

  if (error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6 w-full"
    >
      <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Adam, sans-serif' }}>
        Latest artists I listened to
      </h3>

      {isLoading ? (
        <div className="flex gap-[10px]">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div
          ref={emblaRef}
          className="overflow-hidden"
          data-lenis-prevent
          onMouseLeave={() => emblaApi?.plugins()?.autoScroll?.play?.()}
        >
          <div className="flex">
            {albums.map((album, i) => (
              <div
                key={`${album.artist}-${album.name}-${i}`}
                className="shrink-0 group text-center"
                style={{ minWidth: 160, paddingLeft: 10 }}
              >
                <a
                  href={album.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                >
                  <img
                    src={album.imageUrl}
                    alt={`${album.name} by ${album.artist}`}
                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    draggable={false}
                  />
                  <p className="text-xs mt-2 text-white/80 group-hover:text-white transition-colors leading-tight line-clamp-1">
                    {album.artist}
                  </p>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
