import { useState, useEffect, useRef, useCallback } from 'react';
import type { RecentTrack, LastfmRecentTracksResponse } from '../types/lastfm';

const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
const CACHE_KEY = 'lastfm_recent_tracks';
const CACHE_DURATION_MS = 1000 * 60 * 5; // 5 minutes
const POLL_INTERVAL_MS = 1000 * 60; // 1 minute

type CachedData = {
  tracks: RecentTrack[]
  timestamp: number
}

function getCached(): RecentTrack[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedData = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_DURATION_MS) return null;
    return cached.tracks;
  } catch {
    return null;
  }
}

function setCache(tracks: RecentTrack[]) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ tracks, timestamp: Date.now() }));
}

function extractImageUrl(images: ReadonlyArray<{ '#text': string; size: string }>, preferLarge = false): string {
  const size = preferLarge ? 'extralarge' : 'medium';
  const match = images.find((img) => img.size === size);
  return match?.['#text'] ?? images[images.length - 1]?.['#text'] ?? '';
}

function mapTracks(data: LastfmRecentTracksResponse): RecentTrack[] {
  return data.recenttracks.track.map((t) => ({
    name: t.name,
    artist: t.artist['#text'],
    album: t.album['#text'],
    imageUrl: extractImageUrl(t.image),
    largeImageUrl: extractImageUrl(t.image, true),
    url: t.url,
    nowPlaying: t['@attr']?.nowplaying === 'true',
    date: t.date ? parseInt(t.date.uts, 10) * 1000 : undefined,
  }));
}

export function useRecentTracks(username: string, limit = 10) {
  const [tracks, setTracks] = useState<RecentTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTracks = useCallback(() => {
    const apiKey = import.meta.env.VITE_LASTFM_API_KEY as string;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      setError('Last.fm API key not configured');
      setIsLoading(false);
      return;
    }

    const url = `${LASTFM_BASE_URL}?method=user.getRecentTracks&user=${username}&api_key=${apiKey}&format=json&limit=${limit}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Last.fm API error: ${res.status}`);
        return res.json() as Promise<LastfmRecentTracksResponse>;
      })
      .then((data) => {
        const mapped = mapTracks(data);
        setCache(mapped);
        setTracks(mapped);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [username, limit]);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setTracks(cached);
      setIsLoading(false);
    } else {
      fetchTracks();
    }

    intervalRef.current = setInterval(() => fetchTracks(), POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchTracks]);

  const refresh = useCallback(() => fetchTracks(), [fetchTracks]);

  return { tracks, isLoading, error, refresh };
}
