import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LoginForm } from '@/components/login-form';
import { SignupForm } from '@/components/signup-form';
import EventCardHome from '@/components/EventCard/EventCardHome';
import EventCardList from '@/components/EventCard/EventCardList';
import EventCardMap from '@/components/EventCard/EventCardMap';
import EventList from '@/components/EventCard/EventList';

export default function ComponentPreview() {
  // Sample event data
  const sampleAttendees = [
    { id: '1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
    { id: '4', name: 'Diana', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
  ];

  const sampleEvent = {
    month: 'DEC',
    day: '15',
    title: 'React Meetup - Building Modern UIs',
    location: 'San Luis Obispo, CA',
    datetime: 'Fri, Dec 15 · 6:00 PM PST',
    host: 'Tech Community SLO',
    price: 'Free',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500',
    attendees: sampleAttendees,
    eventId: 'sample-123',
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] bg-clip-text text-transparent">
            Component Preview
          </h1>
          <p className="text-center text-gray-600 mb-12">
            Preview all components in the HangOut application
          </p>

          {/* UI Components Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">UI Components</h2>

            {/* Buttons */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default Button</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            {/* Cards */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card description goes here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">This is the card content area.</p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">Action</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Another Card</CardTitle>
                    <CardDescription>With different content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Cards can contain any content you need.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Form Inputs</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="demo-input">Input Label</Label>
                  <Input id="demo-input" placeholder="Placeholder text" />
                </div>
                <div>
                  <Label htmlFor="demo-email">Email Input</Label>
                  <Input id="demo-email" type="email" placeholder="email@example.com" />
                </div>
                <div>
                  <Label htmlFor="demo-password">Password Input</Label>
                  <Input id="demo-password" type="password" placeholder="••••••••" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="demo-checkbox" />
                  <Label htmlFor="demo-checkbox">Checkbox Label</Label>
                </div>
              </div>
            </div>
          </section>

          {/* Event Cards Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Event Cards</h2>

            {/* EventCardHome */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">EventCardHome - Different States</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex justify-center">
                  <EventCardHome
                    {...sampleEvent}
                    status="Just Viewed"
                  />
                </div>
                <div className="flex justify-center">
                  <EventCardHome
                    {...sampleEvent}
                    status="Saved"
                    title="Tech Workshop - Next.js 15"
                    imageUrl="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500"
                  />
                </div>
                <div className="flex justify-center">
                  <EventCardHome
                    {...sampleEvent}
                    status="Joined"
                    title="Coffee & Code Networking"
                    imageUrl="https://images.unsplash.com/photo-1511578314322-379afb476865?w=500"
                  />
                </div>
              </div>
            </div>

            {/* EventCardList */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">EventCardList - Different States</h3>
              <div className="space-y-4 flex flex-col items-center">
                <EventCardList
                  {...sampleEvent}
                  status="Just Viewed"
                />
                <EventCardList
                  {...sampleEvent}
                  status="Saved"
                  title="Design Systems Workshop"
                  month="JAN"
                  day="20"
                  imageUrl="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"
                />
                <EventCardList
                  {...sampleEvent}
                  status="Joined"
                  title="Startup Pitch Night"
                  month="FEB"
                  day="05"
                  price="10"
                  imageUrl="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500"
                />
              </div>
            </div>

            {/* EventCardMap */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">EventCardMap - With Gradient Border</h3>
              <div className="space-y-4 flex flex-col items-center">
                <EventCardMap
                  {...sampleEvent}
                  status="Just Viewed"
                />
                <EventCardMap
                  {...sampleEvent}
                  status="Saved"
                  title="AI/ML Study Group"
                  month="MAR"
                  day="12"
                  imageUrl="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500"
                />
              </div>
            </div>

            {/* EventList - Database Connected */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">EventList - Scrollable List (Database Connected)</h3>
              <p className="text-sm text-gray-600 mb-4">
                This component fetches hangout data from the MongoDB database via the <code className="bg-gray-100 px-1 rounded">/api/hangouts/list</code> endpoint
                and displays a scrollable list of events with populated host and attendee information.
              </p>
              <div className="border rounded-lg p-4 bg-gray-50">
                <EventList
                  status="upcoming"
                  className="max-h-[600px]"
                />
              </div>
            </div>
          </section>

          {/* Form Components Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Form Components</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Login Form */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Login Form</h3>
                <LoginForm />
              </div>

              {/* Signup Form */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Signup Form</h3>
                <SignupForm />
              </div>
            </div>
          </section>

          {/* Info Footer */}
          <div className="text-center text-sm text-gray-500 mt-12">
            <p>This preview page shows all components with various states and props.</p>
            <p className="mt-2">Run <code className="bg-gray-200 px-2 py-1 rounded">npm run dev</code> and visit <code className="bg-gray-200 px-2 py-1 rounded">/preview</code></p>
          </div>
        </div>
      </div>
    </>
  );
}
