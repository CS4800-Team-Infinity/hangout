import { UserRole } from '../models/User';
import { v4 as uuidv4 } from 'uuid';

export const generateMockUsers = () => [
  {
    email: 'john.doe@example.com',
    username: 'johndoe',
    password: 'Password123',
    name: 'John Doe',
    role: UserRole.USER,
    bio: 'Love exploring new places and meeting people!',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    friends: [],
    isActive: true,
  },
  {
    email: 'jane.smith@example.com',
    username: 'janesmith',
    password: 'Password123',
    name: 'Jane Smith',
    role: UserRole.USER,
    bio: 'Coffee enthusiast and weekend hiker',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    friends: [],
    isActive: true,
  },
  {
    email: 'mike.wilson@example.com',
    username: 'mikewilson',
    password: 'Password123',
    name: 'Mike Wilson',
    role: UserRole.USER,
    bio: 'Tech geek and board game lover',
    friends: [],
    isActive: true,
  },
  {
    email: 'sarah.brown@example.com',
    username: 'sarahbrown',
    password: 'Password123',
    name: 'Sarah Brown',
    role: UserRole.USER,
    bio: 'Foodie and photography enthusiast',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    friends: [],
    isActive: true,
  },
  {
    email: 'alex.johnson@example.com',
    username: 'alexjohnson',
    password: 'Password123',
    name: 'Alex Johnson',
    role: UserRole.USER,
    bio: 'Music lover and concert goer',
    friends: [],
    isActive: true,
  },
  {
    email: 'lisa.garcia@example.com',
    username: 'lisagarcia',
    password: 'Password123',
    name: 'Lisa Garcia',
    role: UserRole.USER,
    bio: 'Yoga instructor and wellness advocate',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    friends: [],
    isActive: true,
  },
  {
    email: 'david.martinez@example.com',
    username: 'davidmartinez',
    password: 'Password123',
    name: 'David Martinez',
    role: UserRole.USER,
    bio: 'Outdoor adventure seeker',
    friends: [],
    isActive: true,
  },
  {
    email: 'emma.davis@example.com',
    username: 'emmadavis',
    password: 'Password123',
    name: 'Emma Davis',
    role: UserRole.USER,
    bio: 'Artist and creative soul',
    profilePicture: 'https://images.unsplash.com/photo-1507101105822-7472b28e22ac?w=150&h=150&fit=crop&crop=face',
    friends: [],
    isActive: true,
  },
  {
    guestId: uuidv4(),
    name: 'Guest User',
    role: UserRole.GUEST,
    tempEmail: 'guest@temp.com',
    isActive: true,
  }
];

export const generateMockHangouts = (userIds: string[]) => {
  const today = new Date();
  const getRandomFutureDate = (daysFromNow: number = 30) => {
    const randomDays = Math.floor(Math.random() * daysFromNow) + 1;
    const date = new Date(today);
    date.setDate(date.getDate() + randomDays);
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    return date;
  };

  const locations = [
    {
      address: "Golden Gate Park, San Francisco, CA",
      coordinates: { lat: 37.7694, lng: -122.4862 }
    },
    {
      address: "Pier 39, San Francisco, CA",
      coordinates: { lat: 37.8084, lng: -122.4094 }
    },
    {
      address: "Stanford University Campus, Palo Alto, CA",
      coordinates: { lat: 37.4275, lng: -122.1697 }
    },
    {
      address: "Santa Cruz Beach Boardwalk, Santa Cruz, CA",
      coordinates: { lat: 36.9637, lng: -122.0183 }
    },
    {
      address: "Napa Valley Wine Country, Napa, CA",
      coordinates: { lat: 38.2975, lng: -122.2869 }
    },
    {
      address: "Berkeley Marina, Berkeley, CA",
      coordinates: { lat: 37.8647, lng: -122.3107 }
    },
    {
      address: "Half Moon Bay Pumpkin Patch, Half Moon Bay, CA",
      coordinates: { lat: 37.4636, lng: -122.4286 }
    },
    {
      address: "Muir Woods National Monument, Mill Valley, CA",
      coordinates: { lat: 37.8974, lng: -122.5808 }
    }
  ];

  return [
    {
      uuid: uuidv4(),
      title: "Weekend Coffee Meetup",
      description: "Casual coffee meetup to chat and get to know each other. Perfect for meeting new friends in a relaxed environment!",
      host: userIds[0],
      date: getRandomFutureDate(),
      location: locations[0],
      maxParticipants: 6,
      status: 'upcoming',
      isPublic: true,
    },
    {
      uuid: uuidv4(),
      title: "Board Game Night",
      description: "Join us for a fun evening of board games! We have classics like Monopoly and Scrabble, plus some newer strategy games.",
      host: userIds[1],
      date: getRandomFutureDate(),
      location: locations[1],
      maxParticipants: 8,
      status: 'upcoming',
      isPublic: true,
    },
    {
      uuid: uuidv4(),
      title: "Photography Walk",
      description: "Explore the city with fellow photography enthusiasts. Bring your camera and capture some amazing shots!",
      host: userIds[2],
      date: getRandomFutureDate(),
      location: locations[2],
      maxParticipants: 10,
      status: 'upcoming',
      isPublic: true,
    },
    {
      uuid: uuidv4(),
      title: "Cooking Class",
      description: "Learn to make delicious pasta from scratch! All ingredients provided, just bring your appetite.",
      host: userIds[3],
      date: getRandomFutureDate(),
      location: locations[3],
      maxParticipants: 12,
      status: 'upcoming',
      isPublic: false,
    },
    {
      uuid: uuidv4(),
      title: "Beach Volleyball",
      description: "Fun beach volleyball game for all skill levels. Come play and enjoy the sunshine!",
      host: userIds[4],
      date: getRandomFutureDate(),
      location: locations[4],
      maxParticipants: 16,
      status: 'upcoming',
      isPublic: true,
    },
    {
      uuid: uuidv4(),
      title: "Movie Night",
      description: "Outdoor movie screening under the stars. Bring blankets and snacks!",
      host: userIds[5],
      date: getRandomFutureDate(),
      location: locations[5],
      maxParticipants: 20,
      status: 'upcoming',
      isPublic: true,
    },
    {
      uuid: uuidv4(),
      title: "Hiking Adventure",
      description: "Moderate hiking trail with beautiful views. Perfect for nature lovers and fitness enthusiasts.",
      host: userIds[6],
      date: getRandomFutureDate(),
      location: locations[6],
      maxParticipants: 15,
      status: 'upcoming',
      isPublic: true,
    },
    {
      uuid: uuidv4(),
      title: "Art Gallery Opening",
      description: "Private viewing of local artist exhibitions. Wine and cheese provided!",
      host: userIds[7],
      date: getRandomFutureDate(),
      location: locations[7],
      maxParticipants: 25,
      status: 'upcoming',
      isPublic: false,
    },
    {
      uuid: uuidv4(),
      title: "Tech Networking Event",
      description: "Meet other tech professionals and entrepreneurs. Great for career networking!",
      host: userIds[0],
      date: getRandomFutureDate(),
      location: locations[0],
      maxParticipants: 30,
      status: 'upcoming',
      isPublic: true,
    },
    {
      uuid: uuidv4(),
      title: "Wine Tasting Tour",
      description: "Guided tour of local wineries with tastings. Transportation included!",
      host: userIds[1],
      date: getRandomFutureDate(),
      location: locations[1],
      maxParticipants: 12,
      status: 'upcoming',
      isPublic: false,
    },
    {
      uuid: uuidv4(),
      title: "Morning Yoga Session",
      description: "Start your day with peaceful yoga in the park. All levels welcome!",
      host: userIds[2],
      date: getRandomFutureDate(),
      location: locations[2],
      maxParticipants: 20,
      status: 'upcoming',
      isPublic: true,
    },
    {
      uuid: uuidv4(),
      title: "Book Club Discussion",
      description: "Monthly book club meeting to discuss this month's selection and choose next month's book.",
      host: userIds[3],
      date: getRandomFutureDate(),
      location: locations[3],
      maxParticipants: 10,
      status: 'upcoming',
      isPublic: false,
    },
    {
      uuid: uuidv4(),
      title: "Food Truck Festival",
      description: "Sample delicious food from various local food trucks. Live music included!",
      host: userIds[4],
      date: getRandomFutureDate(),
      location: locations[4],
      maxParticipants: 50,
      status: 'upcoming',
      isPublic: true,
    },
    {
      uuid: uuidv4(),
      title: "Dance Workshop",
      description: "Learn salsa dancing with professional instructors. No partner required!",
      host: userIds[5],
      date: getRandomFutureDate(),
      location: locations[5],
      maxParticipants: 24,
      status: 'upcoming',
      isPublic: true,
    },
    {
      uuid: uuidv4(),
      title: "Trivia Night",
      description: "Test your knowledge at our weekly trivia competition. Prizes for winners!",
      host: userIds[6],
      date: getRandomFutureDate(),
      location: locations[6],
      maxParticipants: 40,
      status: 'upcoming',
      isPublic: true,
    }
  ];
};

export const generateMockRSVPs = (userIds: string[], hangoutIds: string[]) => {
  const rsvps = [];
  const statuses: ('pending' | 'accepted' | 'declined')[] = ['pending', 'accepted', 'declined'];

  for (const hangoutId of hangoutIds) {
    const numParticipants = Math.floor(Math.random() * Math.min(userIds.length, 8)) + 2;
    const selectedUsers = [...userIds].sort(() => 0.5 - Math.random()).slice(0, numParticipants);

    for (const userId of selectedUsers) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const rsvp = {
        hangout: hangoutId,
        user: userId,
        status,
        respondedAt: status !== 'pending' ? new Date() : undefined,
        notes: Math.random() > 0.7 ? 'Looking forward to this event!' : undefined
      };
      rsvps.push(rsvp);
    }
  }

  return rsvps;
};