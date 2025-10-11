import EventCardBase, { EventCardProps } from "./EventCardBase";

export default function EventCardMap(props: EventCardProps) {
  return (
    <div className="p-[2px] rounded-xl bg-gradient-to-r from-[#F178B6] to-[#7879F1] max-w-full">
      <EventCardBase
        {...props}
        variant="list"
        className="
          w-full sm:w-[360px] md:w-[400px] lg:w-[420px]
          h-auto rounded-xl bg-white
          transition-all duration-200 ease-in-out
        "
      />
    </div>
  );
}
