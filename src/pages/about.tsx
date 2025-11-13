import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { useEffect, useState } from "react";

interface TeamMember {
  name: string;
  role: string;
  github: string;
}

export default function About() {
  const [aboutData, setAboutData] = useState<{
    appName: string;
    team: string;
    description: string;
    mission: string;
    features: string[];
    techStack: string[];
    teamMembers: TeamMember[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAboutData(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const features = [
    {
      title: "Event Finder",
      description:
        "Interactive map with filters by category and date. Save and discuss events with your group.",
      icon: "🗺️",
    },
    {
      title: "Quick Create",
      description: "Create an event in seconds with one shareable link.",
      icon: "⚡",
    },
    {
      title: "Smart Polls",
      description: "Suggests the best time and place that fits the group.",
      icon: "🗳️",
    },
    {
      title: "RSVPs & Reminders",
      description: "Clear RSVPs plus reminders so people actually show up.",
      icon: "✅",
    },
    {
      title: "Calendar Sync",
      description: "Auto add the final plan to everyone's calendar.",
      icon: "📅",
    },
    {
      title: "Hangout Tracker",
      description: "Lightweight streaks that make regular meetups easy.",
      icon: "🔥",
    },
  ];

  const problems = [
    "Hard to find a date and time that works for everyone",
    "Managing preferences, budgets, and locations in chat threads is messy",
    "Event discovery is scattered across different apps and sites",
  ];

  return (
    <>
      <Head>
        <title>About - HangOut</title>
        <meta
          name="description"
          content="Learn about HangOut - One place to discover events, pick a time together, and confirm who's in."
        />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section - Figma Design */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-bold text-black leading-tight">
                  Discover. Create.
                </h1>
                <h1 className="text-6xl md:text-7xl font-bold text-purple-600 leading-tight">
                  Hangout.
                </h1>
              </div>

              <p className="text-lg text-gray-700 leading-relaxed max-w-lg">
                Our app makes it easier to discover, join, and create hangout
                events, helping people connect through shared interests.
              </p>

              <Link
                href="/signup"
                className="inline-flex items-center gap-3 px-8 py-4 bg-purple-200 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <span className="text-xl">⭐</span>
                Join Hangout
              </Link>
            </div>

            {/* Right side - Image with overlay */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/events/event1.webp"
                  alt="Friends hanging out"
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                  <p className="text-black font-medium">
                    Find your crowd. Create your moment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Figma Design */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <h2 className="text-5xl font-bold text-center text-black mb-16">
            How It Works
          </h2>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Beach event with many people"
                width={1200}
                height={400}
                className="w-full h-96 object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200 max-w-sm">
                <h3 className="text-xl font-bold text-black mb-2">
                  Discover Events
                </h3>
                <p className="text-gray-700">
                  Browse hangouts based on your interests, location, or trending
                  activities.
                </p>
              </div>

              {/* Pagination dots */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <div className="w-3 h-3 bg-black rounded"></div>
                <div className="w-3 h-3 border-2 border-black rounded"></div>
                <div className="w-3 h-3 border-2 border-black rounded"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Hangout Section - Figma Design */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <h2 className="text-5xl font-bold text-center text-black mb-16">
            Why Hangout?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Simple & Fast Card */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-purple-200 hover:shadow-xl transition-all">
              <h3 className="text-2xl font-bold text-black mb-4">
                Simple & Fast
              </h3>
              <p className="text-gray-700">
                No hassle, just easy event planning and joining.
              </p>
            </div>

            {/* Personalized Card */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-purple-200 hover:shadow-xl transition-all">
              <h3 className="text-2xl font-bold text-black mb-4">
                Personalized
              </h3>
              <p className="text-gray-700">
                See events that match what you love.
              </p>
            </div>

            {/* Social Card */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-purple-200 hover:shadow-xl transition-all">
              <h3 className="text-2xl font-bold text-black mb-4">Social</h3>
              <p className="text-gray-700">
                Connect with friends or meet new people through shared
                experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Existing Content Sections */}
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-20">
          {/* About Us Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold mb-6 text-center">About Us</h2>
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-zinc-200">
              <p className="text-lg text-zinc-700 leading-relaxed">
                {aboutData?.mission ||
                  "Our team, Infinity, is excited to be working on Hangout, an Event Planner & Group Hangout Web App, for Fall 2025. Together, we aim to create a platform that makes organizing events and connecting with friends easier and more enjoyable. With our shared creativity and teamwork, we look forward to building a project that brings people together."}
              </p>
            </div>
          </section>

          {/* The Problem Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold mb-6 text-center">The Problem</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {problems.map((problem, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md p-6 border border-zinc-200 hover:border-[#5D5FEF]/30 transition-all"
                >
                  <p className="text-zinc-700">{problem}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Our Solution Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold mb-6 text-center">
              Our Solution
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-lg p-6 border border-zinc-200 hover:shadow-xl hover:border-[#5D5FEF]/30 transition-all"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] bg-clip-text text-transparent">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-700">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team Section */}
          {aboutData?.teamMembers && aboutData.teamMembers.length > 0 && (
            <section className="mb-20">
              <h2 className="text-4xl font-bold mb-6 text-center">
                Meet the Team
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {aboutData.teamMembers.map((member, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow-lg p-6 border border-zinc-200 hover:shadow-xl hover:border-[#5D5FEF]/30 transition-all text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] flex items-center justify-center text-white text-2xl font-bold">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <h3 className="text-xl  text-zinc-600 font-bold mb-2">
                      {member.name}
                    </h3>
                    <p className="text-sm text-zinc-600 mb-3">{member.role}</p>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#5D5FEF] hover:text-[#EF5DA8] transition-colors"
                    >
                      <span>GitHub</span>
                      <span>→</span>
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] rounded-2xl shadow-2xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to start hanging out?
              </h2>
              <p className="text-lg mb-8 text-white/90">
                Join HangOut today and make organizing events effortless.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/signup"
                  className="inline-flex items-center px-8 py-3 rounded-full bg-white text-[#5D5FEF] font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center px-8 py-3 rounded-full bg-white/10 backdrop-blur text-white font-semibold border-2 border-white/30 hover:bg-white/20 transition-all"
                >
                  Explore Events
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
