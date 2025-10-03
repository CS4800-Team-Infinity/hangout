import EventCardBase, { EventCardProps } from "./EventCardBase";

export default function EventCardList(props: EventCardProps) {
    return (
        <EventCardBase
            {...props}
            variant="list"
            className="w-[520px] h-[160px]"
        />
    );
}
