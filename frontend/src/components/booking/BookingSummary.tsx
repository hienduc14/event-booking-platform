import type { EventDay, EventSchedule, EventSeat } from "../../types/event";
import { formatCurrency, formatDateTime } from "../../utils/format";

export function BookingSummary({
  schedule,
  eventDay,
  selectedTickets,
}: {
  schedule: EventSchedule | null;
  eventDay: EventDay | null;
  selectedTickets: EventSeat[];
}) {
  const estimatedTotal = selectedTickets.reduce((sum, ticket) => sum + Number(ticket.price || 0), 0);

  return (
    <aside className="summary-panel">
      <h2>Booking summary</h2>
      <dl>
        <div>
          <dt>Venue</dt>
          <dd>{schedule?.venue.venue_name || "Select a schedule"}</dd>
        </div>
        <div>
          <dt>Show date</dt>
          <dd>{eventDay ? formatDateTime(eventDay.date) : "Select a day"}</dd>
        </div>
      </dl>
      <div className="summary-list">
        {selectedTickets.map((ticket) => (
          <div key={ticket.ticket_id} className="summary-row">
            <span>
              {ticket.ticket_type} • Seat {ticket.row_label}
              {ticket.col_number}
            </span>
            <strong>{formatCurrency(ticket.price || 0)}</strong>
          </div>
        ))}
      </div>
      {estimatedTotal > 0 && (
        <div className="summary-total">
          <span>Estimated total</span>
          <strong>{formatCurrency(estimatedTotal)}</strong>
        </div>
      )}
    </aside>
  );
}
