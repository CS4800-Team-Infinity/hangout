export interface EventDetails {
  _id: string;
  id?: string; // from toJSON transform
  uuid?: string;
  title: string;
  description: string;
  overview?: string;
  lineup?: string;
  date: string;

  price?: string | number;

  // For Google Maps
  coordinates?: google.maps.LatLngLiteral;

  // Original location from backend
  location: {
    address: string;
    coordinates: [number, number];
  };

  host: {
    _id: string;
    name: string;
    username: string;
    email: string;
    bio?: string;
  };

  imageUrl?: string;
  maxParticipants?: number;
  isPublic: boolean;
  status?: "Joined" | "Saved" | "Just Viewed" | string;

  attendeeCount: number;
  attendees?: Array<{
    _id: string;
    id?: string;
    name: string;
    username: string;
    email: string;
    avatarUrl?: string;
  }>;

  tags?: string[];
}
