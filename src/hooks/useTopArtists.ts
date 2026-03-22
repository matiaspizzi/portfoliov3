import { useState, useEffect } from 'react';
import type { Artist, LastfmTopArtistsResponse } from '../types/lastfm';

const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
const CACHE_KEY = 'lastfm_top_artists';
const CACHE_DURATION_MS = 1000 * 60 * 60;

type CachedData = {
  artists: Artist[]
  timestamp: number
}

function getCached(): Artist[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedData = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_DURATION_MS) return null;
    return cached.artists;
  } catch {
    return null;
  }
}

function setCache(artists: Artist[]) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ artists, timestamp: Date.now() }));
}

function extractImageUrl(images: ReadonlyArray<{ '#text': string; size: string }>): string {
  const extralarge = images.find((img) => img.size === 'extralarge');
  return extralarge?.['#text'] ?? images[images.length - 1]?.['#text'] ?? '';
}

export function useTopArtists(username: string, limit = 20) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setArtists(cached);
      setIsLoading(false);
      return;
    }

    const apiKey = import.meta.env.VITE_LASTFM_API_KEY as string;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      setError('Last.fm API key not configured');
      setIsLoading(false);
      return;
    }

    const url = `${LASTFM_BASE_URL}?method=user.getTopArtists&user=${username}&api_key=${apiKey}&format=json&period=6month&limit=${limit}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Last.fm API error: ${res.status}`);
        return res.json() as Promise<LastfmTopArtistsResponse>;
      })
      .then((data) => {
        const mapped = data.topartists.artist
          .map((a) => ({
            name: a.name,
            imageUrl: extractImageUrl(a.image),
            playcount: parseInt(a.playcount, 10),
            url: a.url,
          }))
          .filter((a) => a.imageUrl !== '');

        setCache(mapped);
        setArtists(mapped);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [username, limit]);

  return { artists, isLoading, error };
}
