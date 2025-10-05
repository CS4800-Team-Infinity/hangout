import EventCardBase, { EventCardProps } from "./EventCardBase";

export default function EventCardHome(props: EventCardProps) {
    return (
        <EventCardBase
            {...props}
            variant="home"
            className="flex-col w-[400px] h-[160px]"
            actions={true}
        />
    );
}
