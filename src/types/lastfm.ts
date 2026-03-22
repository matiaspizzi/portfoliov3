type LastfmImage = {
  '#text': string
  size: 'small' | 'medium' | 'large' | 'extralarge' | 'mega'
}

type LastfmArtist = {
  name: string
  url: string
}

export type LastfmAlbum = {
  name: string
  artist: LastfmArtist
  image: ReadonlyArray<LastfmImage>
  playcount: string
  url: string
}

export type LastfmTopAlbumsResponse = {
  topalbums: {
    album: LastfmAlbum[]
  }
}

export type Album = {
  name: string
  artist: string
  imageUrl: string
  playcount: number
  url: string
}

// Top Artists
export type LastfmTopArtist = {
  name: string
  image: ReadonlyArray<LastfmImage>
  playcount: string
  url: string
}

export type LastfmTopArtistsResponse = {
  topartists: {
    artist: LastfmTopArtist[]
  }
}

export type Artist = {
  name: string
  imageUrl: string
  playcount: number
  url: string
}

// Recent Tracks
export type LastfmRecentTrack = {
  name: string
  artist: { '#text': string }
  album: { '#text': string }
  image: ReadonlyArray<LastfmImage>
  url: string
  date?: { uts: string; '#text': string }
  '@attr'?: { nowplaying: string }
}

export type LastfmRecentTracksResponse = {
  recenttracks: {
    track: LastfmRecentTrack[]
  }
}

export type RecentTrack = {
  name: string
  artist: string
  album: string
  imageUrl: string
  largeImageUrl: string
  url: string
  nowPlaying: boolean
  date?: number
}
