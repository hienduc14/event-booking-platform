export type Artist = {
  artist_id: number;
  artist_name: string;
  bio?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type ArtistCreate = {
  artist_name: string;
  bio?: string;
  image_url?: string;
};

export type EventArtistCreate = {
  event_day_id: number;
  artist_id: number;
  is_backup: boolean;
};

export type EventArtistRead = EventArtistCreate & {
  event_artist_id: number;
  artist_name: string;
};

