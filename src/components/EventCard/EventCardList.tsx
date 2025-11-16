import EventCardBase, { EventCardProps } from "./EventCardBase";

export default function EventCardList(props: EventCardProps) {
  const eventId = props.eventId || (props as any)._id || (props as any).id;

  return (
    <div className="p-[2px] bg-gray-100 rounded-xl max-w-full overflow-visible">
      <EventCardBase
        {...props}
        variant="list"
        eventId={eventId}
        className="
        w-full 
        rounded-2xl shadow-md
        transition-all duration-300
        hover:shadow-lg
      "
      />
    </div>
  );
}
