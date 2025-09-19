import type { NextApiRequest, NextApiResponse } from 'next';

interface AboutResponse {
  success: boolean;
  data: {
    appName: string;
    team: string;
    description: string;
    mission: string;
    features: string[];
    techStack: string[];
    teamMembers: Array<{
      name: string;
      role: string;
      github: string;
    }>;
  };
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AboutResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      data: {
        appName: '',
        team: '',
        description: '',
        mission: '',
        features: [],
        techStack: [],
        teamMembers: []
      }
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      appName: "Hangout",
      team: "Infinity",
      description: "An Event Planner & Group Hangout Web App for Fall 2025. One place to discover events, pick a time together, and confirm who is in.",
      mission: "Together, we aim to create a platform that makes organizing events and connecting with friends easier and more enjoyable. With our shared creativity and teamwork, we look forward to building a project that brings people together.",
      features: [
        "Discover local events on a map",
        "Create events in seconds",
        "Smart polls choose time and place",
        "Event Finder with interactive map",
        "Quick Create with shareable links",
        "RSVPs & Reminders",
        "Calendar Sync",
        "Hangout Tracker with streaks"
      ],
      techStack: [
        "Next.js (React with TypeScript)",
        "MongoDB with Mongoose",
        "JWT Authentication",
        "Tailwind CSS",
        "WebSockets for real-time updates",
        "Email and SMS notifications"
      ],
      teamMembers: [
        {
          name: "Tam Tran",
          role: "Full-stack Developer, UX/UI Designer",
          github: "https://github.com/itistamtran"
        },
        {
          name: "Kenneth Chau",
          role: "Full-stack Developer",
          github: "https://github.com/contactkc"
        },
        {
          name: "Kira Inman",
          role: "Full-stack Developer",
          github: "https://github.com/CranKinman"
        },
        {
          name: "David Torres",
          role: "Full-stack Developer",
          github: "https://github.com/datorres335"
        }
      ]
    }
  });
}