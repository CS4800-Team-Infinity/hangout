export interface EventDetails {
  _id: string;
  id?: string; // from toJSON transform
  uuid?: string;
  title: string;
  description: string;
  date: string;

  price: number;

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
  status: string;

  attendeeCount: number;
  attendees: Array<{
    _id: string;
    name: string;
    username: string;
    email: string;
  }>;

  tags?: string[];
}
