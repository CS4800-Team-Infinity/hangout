export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  profilePicture?: string;
  bio?: string;
  createdAt?: Date;
  lastActive?: Date;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  error?: string;
}

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://gethangout.app/"
    : typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000";

const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}/api${endpoint}`;
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // add auth header if token exists
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    // For auth endpoints, return the response data even if not ok
    // This allows proper error handling in the auth context
    if (
      !res.ok &&
      (endpoint.startsWith("/auth/") || endpoint.startsWith("/admin/"))
    ) {
      return data;
    }

    if (!res.ok) {
      throw new Error(data.error || `http error! status: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error("api call failed:", error);
    throw error;
  }
};

export const authAPI = {
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    return apiCall<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  getMe: async (): Promise<AuthResponse> => {
    return apiCall<AuthResponse>("/auth/me", {
      method: "GET",
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
};

export const tokenUtils = {
  saveToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },

  hasToken: (): boolean => {
    return !!tokenUtils.getToken();
  },
};

export const userUtils = {
  saveUser: (user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  getUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  removeUser: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  },
};

// Hangout types
export interface Attendee {
  id: string;
  name: string;
  avatarUrl: string;
}

export type GeoJSONLocation = {
  type: "Point";
  coordinates: [number, number];
  address?: string;
};

export interface HangoutEvent {
  _id?: string;
  uuid?: string;
  title: string;
  description?: string;
  host: string | { name?: string; email?: string };
  date?: string | Date;
  datetime?: string;
  location: string | GeoJSONLocation;
  status?:
    | "upcoming"
    | "ongoing"
    | "completed"
    | "cancelled"
    | "Joined"
    | "Saved"
    | "Just Viewed";
  price?: string;
  imageUrl?: string;
  attendees?: Attendee[];
  registrationUrl?: string;
  coordinates?: { lat: number; lng: number };
  month?: string;
  day?: string;
  isPublic?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface HangoutsListResponse {
  success: boolean;
  events: HangoutEvent[];
  error?: string;
}

export const hangoutsAPI = {
  getList: async (params?: {
    status?: "upcoming" | "ongoing" | "completed" | "cancelled" | "all";
    isPublic?: boolean;
    lat?: number;
    lng?: number;
    q?: string; // Search query for event title
  }): Promise<HangoutsListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.status) {
      queryParams.append("status", params.status);
    }

    if (params?.isPublic !== undefined) {
      queryParams.append("isPublic", params.isPublic.toString());
    }

    // Include lat/lng only if provided
    if (params?.lat && params?.lng) {
      queryParams.append("lat", params.lat.toString());
      queryParams.append("lng", params.lng.toString());
    }

    // Include search query if provided
    if (params?.q && params.q.trim()) {
      queryParams.append("q", params.q.trim());
    }

    const query = queryParams.toString();
    const endpoint = `/hangouts/list${query ? `?${query}` : ""}`;

    return apiCall<HangoutsListResponse>(endpoint, {
      method: "GET",
    });
  },
};
