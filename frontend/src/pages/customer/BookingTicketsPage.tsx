import { useParams } from "react-router-dom";
import { getTicketsByBooking } from "../../api/tickets";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { PageHeader } from "../../components/common/PageHeader";
import { TicketCard } from "../../components/tickets/TicketCard";
import { useAsync } from "../../hooks/useAsync";

function BookingTicketsPage() {
  const bookingId = Number(useParams().bookingId);
  const { data: tickets, loading, error, reload } = useAsync(() => getTicketsByBooking(bookingId), [bookingId]);

  return (
    <div className="stack-lg">
      <PageHeader title={`Tickets for booking #${bookingId}`} description="Electronic tickets generated after successful payment." />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={() => void reload()} />}
      {!loading && !error && tickets?.length === 0 && <EmptyState title="No tickets found" description="Payment may not be completed yet." />}
      {!loading && !error && tickets && tickets.length > 0 && (
        <div className="ticket-grid">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.ticket_code} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingTicketsPage;

