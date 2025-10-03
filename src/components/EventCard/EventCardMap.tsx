import EventCardBase, { EventCardProps } from "./EventCardBase";

export default function EventCardMap(props: EventCardProps) {
  return (
    <div className="p-[2px] rounded-xl bg-gradient-to-r from-[#F178B6] to-[#7879F1]">
      <EventCardBase
        {...props}
        variant="list"
        className="w-[520px] h-[160px] rounded-xl bg-white"
        imageClassName="w-28 h-20 min-w-[112px] min-h-[80px]"
      />
    </div>

  );
}
