import type { EventDay, EventSchedule, EventSeat } from "../../types/event";
import { formatCurrency, formatDateTime } from "../../utils/format";
import { Icon } from "../common/Icon";

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
      <h2>
        <Icon name="ticket" size={18} />
        Booking summary
      </h2>
      <dl>
        <div>
          <dt>
            <Icon name="location" size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            Venue
          </dt>
          <dd>{schedule?.venue.venue_name || "Select a schedule"}</dd>
        </div>
        <div>
          <dt>
            <Icon name="calendar" size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            Show date
          </dt>
          <dd>{eventDay ? formatDateTime(eventDay.date) : "Select a day"}</dd>
        </div>
        <div>
          <dt>
            <Icon name="users" size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            Seats
          </dt>
          <dd>{selectedTickets.length || "—"}</dd>
        </div>
      </dl>

      {selectedTickets.length === 0 ? (
        <div className="summary-empty">
          <Icon name="info" size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
          Pick a seat from the list to see your total.
        </div>
      ) : (
        <div className="summary-list">
          {selectedTickets.map((ticket) => (
            <div key={ticket.ticket_id} className="summary-row">
              <span>
                {ticket.ticket_type} · Seat {ticket.row_label}
                {ticket.col_number}
              </span>
              <strong>{formatCurrency(ticket.price || 0)}</strong>
            </div>
          ))}
        </div>
      )}

      {estimatedTotal > 0 && (
        <div className="summary-total">
          <span>Estimated total</span>
          <strong>{formatCurrency(estimatedTotal)}</strong>
        </div>
      )}
    </aside>
  );
}
