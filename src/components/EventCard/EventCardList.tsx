import EventCardBase, { EventCardProps } from "./EventCardBase";

export default function EventCardList(props: EventCardProps) {
  return (
    <EventCardBase
      {...props}
      variant="list"
      className="
        w-[70%] sm:w-[60%] md:w-[520px] 
        h-[240px] sm:h-[260px] md:h-[160px] 
        mx-auto 
        bg-white rounded-2xl shadow-md 
        p-3 sm:p-4 md:p-5 
        transition-all duration-300
      "
    />
  );
}
