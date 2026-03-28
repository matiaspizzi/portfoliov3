import { useState, useEffect, useMemo } from 'react';

const photoModules = import.meta.glob<{ default: string }>(
  '../../assets/photos/*.{png,PNG,webp,jpg,jpeg}',
  { eager: false }
);

const allPhotoPaths = Object.keys(photoModules).sort((a, b) => {
  const numA = parseInt(a.match(/\/(\d+)/)?.[1] ?? '999999', 10);
  const numB = parseInt(b.match(/\/(\d+)/)?.[1] ?? '999999', 10);
  if (numA !== numB) return numA - numB;
  return a.localeCompare(b);
});

const COLS = 3;

function distributeToColumns(photos: string[], cols: number): string[][] {
  const columns: string[][] = Array.from({ length: cols }, () => []);
  photos.forEach((src, i) => {
    columns[i % cols].push(src);
  });
  return columns;
}

export function PhotoGrid() {
  const [photos, setPhotos] = useState<string[]>([]);

  const columns = useMemo(() => distributeToColumns(photos, COLS), [photos]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      allPhotoPaths.map(async (path) => {
        const mod = await photoModules[path]();
        return mod.default;
      })
    ).then((urls) => {
      if (!cancelled) setPhotos(urls);
    });
    return () => { cancelled = true; };
  }, []);

  if (photos.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        data-lenis-prevent
        className="h-[70vh] overflow-y-auto scrollbar-thin pr-2"
      >
        <div className="flex gap-3">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="flex-1 flex flex-col gap-3">
              {col.map((src, i) => (
                <div key={i} className="overflow-hidden rounded-lg">
                  <img
                    src={src}
                    alt={`Photo ${colIndex + i * COLS + 1}`}
                    className="w-full hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className="text-center text-white/20 text-xs py-4">
          {photos.length} photos
        </p>
      </div>
    </div>
  );
}
