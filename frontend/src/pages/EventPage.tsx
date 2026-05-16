import { useParams } from "react-router-dom";
import TicketBookingForm from "../components/TicketBookingForm";

function EventPage() {
  const { eventId } = useParams();

  return (
    <main>
      <h1>Event detail</h1>
      <p>Event ID: {eventId}</p>
      <TicketBookingForm eventId={Number(eventId)} />
    </main>
  );
}

export default EventPage;
