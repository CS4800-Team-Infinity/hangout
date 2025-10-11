import EventCardBase, { EventCardProps } from "./EventCardBase";

export default function EventCardHome(props: EventCardProps) {
  return (
    <div className="flex justify-center sm:justify-start w-full">
      <EventCardBase
        {...props}
        variant="home"
        className="flex-col w-[340px] sm:w-[340px] md:w-[380px] min-h-fit mx-auto"
        actions={true}
      />
    </div>
  );
}
