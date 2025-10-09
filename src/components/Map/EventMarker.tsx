import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { HangoutEvent } from '@/lib/api';
import EventCardMap from '../EventCard/EventCardMap';
import { MapPin } from 'lucide-react';

interface EventMarkerProps {
  event: HangoutEvent;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export default function EventMarker({
  event,
  isSelected,
  onSelect,
  onClose
}: EventMarkerProps) {
  if (!event.coordinates) return null;

  const position = {
    lat: event.coordinates.lat,
    lng: event.coordinates.lng
  };

  return (
    <>
      <AdvancedMarker
        position={position}
        onClick={onSelect}
        title={event.title}
      >
        <div className="relative">
          <div
            className={`
              flex items-center justify-center w-10 h-10 rounded-full
              transition-all duration-200 cursor-pointer
              ${isSelected
                ? 'bg-gradient-to-r from-[#7879F1] to-[#F178B6] scale-110'
                : 'bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] hover:scale-105'
              }
              shadow-lg
            `}
          >
            <MapPin className="w-5 h-5 text-white" fill="white" />
          </div>

          {/* Pulse animation for non-selected markers */}
          {!isSelected && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7879F1] to-[#F178B6] opacity-75 animate-ping" />
          )}
        </div>
      </AdvancedMarker>

      {isSelected && (
        <InfoWindow
          position={position}
          onCloseClick={onClose}
          headerContent={
            <h3 className="font-semibold text-sm text-gray-900">{event.title}</h3>
          }
        >
          <div className="p-2">
            <EventCardMap
              month={event.month}
              day={event.day}
              title={event.title}
              location={event.location}
              datetime={event.datetime}
              host={event.host}
              status={event.status}
              price={event.price}
              imageUrl={event.imageUrl}
              attendees={event.attendees}
              eventId={event.eventId}
              registrationUrl={event.registrationUrl}
              actions={false}
            />
          </div>
        </InfoWindow>
      )}
    </>
  );
}
