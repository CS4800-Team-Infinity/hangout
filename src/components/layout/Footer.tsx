import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#2b001a] text-white pt-10 pb-6 px-8 md:px-16 rounded-t-3xl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Row 1: Logo + tagline */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/infinity-logo.png"
              alt="HangOut Logo"
              width={45}
              height={45}
            />
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              HangOut
            </h2>
          </div>
          <h2 className="text-center md:text-right text-base md:text-xl font-semibold mt-4 md:mt-0">
            See what’s happening, or make it happen.{" "}
            <Link
              href="/signup"
              className="text-[#EF5DA8] cursor-pointer hover:underline hover:text-pink-300 transition-colors"
            >
              Get Started!
            </Link>
          </h2>
        </div>

        {/* Row 2: Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center md:text-left">
          {/* Your account */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-base font-semibold text-[#5D5FEF] mb-3">
              Your account
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="/signup" className="link-gradient">
                  Sign up
                </a>
              </li>
              <li>
                <a href="/login" className="link-gradient">
                  Log in
                </a>
              </li>
            </ul>
          </div>

          {/* Discover */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-base font-semibold text-[#5D5FEF] mb-3">
              Discover
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="/explore" className="link-gradient">
                  Explore
                </a>
              </li>
              <li>
                <a href="/events" className="link-gradient">
                  Events
                </a>
              </li>
              <li>
                <a href="/" className="link-gradient">
                  Topic
                </a>
              </li>
              <li>
                <a href="/" className="link-gradient">
                  Online event
                </a>
              </li>
            </ul>
          </div>

          {/* Hangout */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-base font-semibold text-[#5D5FEF] mb-3">
              Hangout
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="/about" className="link-gradient">
                  About
                </a>
              </li>
              <li>
                <a href="/" className="link-gradient">
                  Contact us
                </a>
              </li>
              <li>
                <a href="/" className="link-gradient">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/" className="link-gradient">
                  FAQs
                </a>
              </li>
              <li>
                <a href="/" className="link-gradient">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="link-gradient">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-use" className="link-gradient">
                  Terms of Use
                </a>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="flex flex-col items-center md:items-start">
            {/* Follow us box */}
            <div className="bg-white/80 rounded-2xl py-3 px-6 shadow-md w-full sm:w-3/4 md:w-full">
              <p className="text-center text-base text-[#2b001a] font-medium mb-2">
                Follow us
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  aria-label="Facebook"
                >
                  <span className="icon-mask icon-facebook bg-[#2b001a] group-hover:bg-gradient-to-r group-hover:from-[#5D5FEF] group-hover:to-[#EF5DA8] group-hover:scale-110" />
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  aria-label="Instagram"
                >
                  <span className="icon-mask icon-instagram bg-[#2b001a] group-hover:bg-gradient-to-r group-hover:from-[#5D5FEF] group-hover:to-[#EF5DA8] group-hover:scale-110" />
                </a>
                <a
                  href="https://www.tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  aria-label="TikTok"
                >
                  <span className="icon-mask icon-tiktok bg-[#2b001a] group-hover:bg-gradient-to-r group-hover:from-[#5D5FEF] group-hover:to-[#EF5DA8] group-hover:scale-110" />
                </a>
              </div>
            </div>

            {/* Language Selector */}
            <div
              id="google_translate_element"
              className="mt-4 text-center"
            ></div>
          </div>
        </div>

        {/* Row 3: Copyright */}
        <div className="text-center md:text-left text-sm text-gray-300 pt-4 pb-4">
          © 2025 Hangout@Infinity. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
