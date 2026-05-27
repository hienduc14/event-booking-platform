import { Link, useParams } from "react-router-dom";
import { getTicketsByBooking } from "../../api/tickets";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Icon } from "../../components/common/Icon";
import { PageHeader } from "../../components/common/PageHeader";
import { TicketCard } from "../../components/tickets/TicketCard";
import { useAsync } from "../../hooks/useAsync";

function BookingTicketsPage() {
  const bookingId = Number(useParams().bookingId);
  const { data: tickets, loading, error, reload } = useAsync(() => getTicketsByBooking(bookingId), [bookingId]);

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow={`Booking #${bookingId}`}
        eyebrowIcon="ticket"
        title="Your e-tickets"
        description="Electronic tickets are generated after a successful payment. Save them or show the QR at the venue."
        actions={
          <Link to="/events" className="button button-outline button-sm">
            Back to events
          </Link>
        }
      />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={() => void reload()} />}
      {!loading && !error && tickets?.length === 0 && (
        <EmptyState
          title="No tickets yet"
          description="Payment may not be completed. Once the webhook confirms payment, tickets will appear here."
          icon="info"
          actions={
            <Link to={`/checkout/${bookingId}`} className="button button-primary button-sm">
              Back to checkout
              <Icon name="arrow-right" size={14} />
            </Link>
          }
        />
      )}
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
