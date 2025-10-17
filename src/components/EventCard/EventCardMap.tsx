import EventCardBase, { EventCardProps } from "./EventCardBase";

export default function EventCardMap(props: EventCardProps) {
  return (
    <div className="relative rounded-xl bg-gradient-to-r from-[#F178B6] to-[#7879F1] p-[2px] w-fit overflow-visible">
      <div className="rounded-[10px] bg-white">
        <EventCardBase
          {...props}
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
