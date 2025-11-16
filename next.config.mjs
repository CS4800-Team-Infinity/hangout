/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Temporary setup for development:
    // Allow loading images directly from any HTTPS URL (e.g., user-pasted links).
    // In the future, switch to our own storage solution (like AWS S3 or Cloudinary)
    // and remove `unoptimized: true` once upload handling is implemented.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allows any HTTPS domain
      },
    ],
    // temporary: bypass Next.js image optimization
    unoptimized: true,
    // Increase deviceSizes and imageSizes for better optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Set formats
    formats: ["image/webp"],
    // Disable minimumCacheTTL for development
    minimumCacheTTL: 60,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove console.logs only in production
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

export default nextConfig;
