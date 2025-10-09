import type { NextPage } from "next";

import EventCardHome from "@/components/EventCard/EventCardHome";
import EventCardList from "@/components/EventCard/EventCardList";
import EventCardMap from "@/components/EventCard/EventCardMap";

const TestCards: NextPage = () => {
    return (
        <div className="flex flex-col items-center pt-10 pb-20 bg-gray-50 min-h-screen">
            <p className="text-xl text-zinc-600 mb-10">Test EventCard Variants</p>

            {/* Cards stacked vertically */}
            <div className="flex flex-col gap-10 w-full max-w-xl">
                {/* EventCardHome */}
                <EventCardHome
                    month="OCT"
                    day="6"
                    title="Human to Human: Interviewing Across Disciplines"
                    location="Cal Poly Pomona: Bldg 162, Room 1002"
                    datetime="Mon, Oct 6, 2025 at 4 PM PDT"
                    host="DHC"
                    status="Just Viewed"
                    price="0.00"
                    imageUrl="/images/events/event1.webp"
                    registrationUrl="https://dhc-events.com/rsvp/456"
                    eventId="event-456"
                />

                {/* EventCardList */}
                <EventCardList
                    month="SEP"
                    day="25"
                    title="From Stuck to Secure: Working Through Limiting Beliefs in Dating"
                    location="Online"
                    datetime="Thu, Sep 25, 2025 at 7 PM PDT"
                    host="Smart Dating"
                    status="Saved"
                    price="15.00"
                    imageUrl="/images/events/event1.webp"
                    registrationUrl="https://smartdating.com/rsvp/789"
                    eventId="event-789"
                />

                {/* EventCardMap */}
                <EventCardMap
                    month="NOV"
                    day="10"
                    title="From Stuck to Secure: Working Through Limiting Beliefs in Dating"
                    location="Student Center"
                    datetime="Mon, Nov 10, 2025 at 3 PM"
                    host="CPP Career Services"
                    status="Joined"
                    price="Free"
                    imageUrl="/images/events/event1.webp"
                    registrationUrl="https://cppcareer.com/rsvp/secure-event-123"
                    eventId="event-123"
                />
            </div>
        </div>
    );
};

export default TestCards;
