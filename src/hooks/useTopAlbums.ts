import { useState, useEffect, useRef, useCallback } from 'react';
import type { Album, LastfmTopAlbumsResponse } from '../types/lastfm';

const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
const CACHE_KEY = 'lastfm_top_albums';
const CACHE_DURATION_MS = 1000 * 60 * 5; // 5 minutes
const POLL_INTERVAL_MS = 1000 * 60 * 5; // 5 minutes

type CachedData = {
  albums: Album[]
  timestamp: number
}

function getCached(): Album[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedData = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_DURATION_MS) return null;
    return cached.albums;
  } catch {
    return null;
  }
}

function setCache(albums: Album[]) {
  const data: CachedData = { albums, timestamp: Date.now() };
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

function extractImageUrl(images: ReadonlyArray<{ '#text': string; size: string }>): string {
  const extralarge = images.find((img) => img.size === 'extralarge');
  return extralarge?.['#text'] ?? images[images.length - 1]?.['#text'] ?? '';
}

export function useTopAlbums(username: string, limit = 20) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAlbums = useCallback(() => {
    const apiKey = import.meta.env.VITE_LASTFM_API_KEY as string;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      setError('Last.fm API key not configured');
      setIsLoading(false);
      return;
    }

    const fetchLimit = limit * 3;
    const url = `${LASTFM_BASE_URL}?method=user.getTopAlbums&user=${username}&api_key=${apiKey}&format=json&period=7day&limit=${fetchLimit}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Last.fm API error: ${res.status}`);
        return res.json() as Promise<LastfmTopAlbumsResponse>;
      })
      .then((data) => {
        const all = data.topalbums.album
          .map((a) => ({
            name: a.name,
            artist: a.artist.name,
            imageUrl: extractImageUrl(a.image),
            playcount: parseInt(a.playcount, 10),
            url: a.url,
          }))
          .filter((a) => a.imageUrl !== '');

        const seen = new Set<string>();
        const unique: typeof all = [];
        for (const album of all) {
          const key = album.artist.toLowerCase();
          if (!seen.has(key)) { seen.add(key); unique.push(album); }
          if (unique.length >= limit) break;
        }

        setCache(unique);
        setAlbums(unique);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [username, limit]);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setAlbums(cached);
      setIsLoading(false);
    } else {
      fetchAlbums();
    }

    intervalRef.current = setInterval(fetchAlbums, POLL_INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchAlbums]);

  return { albums, isLoading, error };
}
