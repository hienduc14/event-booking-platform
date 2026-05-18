export type Venue = {
  venue_id: number;
  venue_name: string;
  city: string;
  address?: string | null;
  capacity: number;
  created_at: string;
  updated_at: string;
};

export type VenueCreate = {
  venue_name: string;
  city: string;
  address?: string;
  capacity: number;
};

export type VenueUpdate = Partial<VenueCreate>;

