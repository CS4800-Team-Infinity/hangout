import { render, screen, fireEvent } from "@testing-library/react";
import EventCardHome from "@/components/EventCard/EventCardHome";
import EventCardList from "@/components/EventCard/EventCardList";
import EventCardMap from "@/components/EventCard/EventCardMap";

describe("EventCardHome", () => {
  it("renders event details correctly", () => {
    render(
      <EventCardHome
        month="OCT"
        day="6"
        title="Human to Human"
        location="CPP Library"
        datetime="Oct 6, 2025 at 4PM"
        host="DHC"
        status="Just Viewed"
        price="0.00"
        imageUrl="/images/events/event1.webp"
        eventId="event-001"
      />
    );

    expect(screen.getByText("Human to Human")).toBeInTheDocument();
    expect(screen.getByText("by DHC")).toBeInTheDocument();
    expect(screen.getByText(/Oct 6, 2025 at 4PM/)).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();

  });
});

describe("EventCardList", () => {
  it("can toggle Save/Unsave using heart button", () => {
    render(
      <EventCardList
        month="SEP"
        day="25"
        title="Smart Dating Workshop"
        location="Online"
        datetime="Sep 25, 2025 at 7PM"
        host="Smart Dating"
        status="Just Viewed"
        price="15.00"
        imageUrl="/images/events/event2.webp"
        eventId="event-002"
      />
    );

    const heartButton = screen.getByRole("button", { name: "Save Event" });
    fireEvent.click(heartButton);
    expect(screen.getByText(/Saved/)).toBeInTheDocument();


    fireEvent.click(heartButton);
    expect(screen.getByText(/Just Viewed/)).toBeInTheDocument();
  });
});

describe("EventCardMap", () => {
  it("opens actions menu and shows Join/Leave options", () => {
    render(
      <EventCardMap
        month="NOV"
        day="10"
        title="Career Workshop"
        location="Student Center"
        datetime="Nov 10, 2025 at 3PM"
        host="CPP Career Services"
        status="Just Viewed"
        price="Free"
        imageUrl="/images/events/event3.webp"
        eventId="event-003"
      />
    );

    // open the 3-dot menu
    const actionsButton = screen.getByRole("button", { name: "More Actions" });
    fireEvent.click(actionsButton);
    expect(screen.getByText("View Details")).toBeInTheDocument();
    expect(screen.getByText("Join Event")).toBeInTheDocument();
  });
});
