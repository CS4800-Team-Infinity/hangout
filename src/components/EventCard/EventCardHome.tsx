import Link from "next/link";
import EventCardBase, { EventCardProps } from "./EventCardBase";

export default function EventCardHome(props: EventCardProps) {
  return (
    <Link
      href={`/events/${props.eventId}`}
      className="flex justify-center sm:justify-start w-full"
    >
      <EventCardBase
        {...props}
        variant="home"
        className="
          flex-col w-[340px] sm:w-[340px] md:w-[380px] min-h-fit mx-auto
          shadow-md hover:shadow-lg hover:shadow-[#5D5FEF]/30
          hover:scale-[1.02] transition-all duration-200 ease-in-out
          cursor-pointer
        "
        actions={true}
      />
    </Link>
  );
}
