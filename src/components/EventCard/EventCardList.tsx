import EventCardBase, { EventCardProps } from "./EventCardBase";

export default function EventCardList(props: EventCardProps) {
  return (
    <EventCardBase
      {...props}
      variant="list"
      className="
        w-full
        bg-white rounded-2xl shadow-md
        transition-all duration-300
        hover:shadow-lg
      "
    />
  );
}
