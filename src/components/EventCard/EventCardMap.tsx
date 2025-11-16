import EventCardBase, { EventCardProps } from "./EventCardBase";

export default function EventCardMap(props: EventCardProps) {
  // Normalize eventId
  const eventId = props.eventId || (props as any)._id || (props as any).id;

  console.log("EventCardMap - Full props:", props);
  console.log("EventCardMap - Extracted eventId:", eventId);

  return (
    <div className="relative rounded-xl bg-gradient-to-r from-[#F178B6] to-[#7879F1] p-[2px] w-fit">
      <div className="rounded-[10px] bg-white overflow-visible">
        <EventCardBase
          {...props}
          eventId={eventId}
          variant="list"
          className="
            w-full sm:w-[360px] md:w-[400px] lg:w-[420px]
            h-auto rounded-[10px] bg-white
            transition-all duration-200 ease-in-out
          "
        />
      </div>
    </div>
  );
}
