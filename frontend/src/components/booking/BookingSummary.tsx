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
  selectedTickets: (EventSeat & { date?: string | null })[];
}) {
  const estimatedTotal = selectedTickets.reduce((sum, ticket) => sum + Number(ticket.price || 0), 0);
  const uniqueDates = Array.from(new Set(selectedTickets.map((t) => t.date).filter(Boolean) as string[]));

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
          <dd>
            {uniqueDates.length > 1
              ? `${uniqueDates.length} days selected`
              : uniqueDates.length === 1
              ? formatDateTime(uniqueDates[0])
              : eventDay
              ? formatDateTime(eventDay.date)
              : "Select a day"}
          </dd>
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
        <div className="summary-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {selectedTickets.map((ticket) => (
            <div key={ticket.ticket_id} className="summary-card" style={{ background: "var(--panel-bg-subtle, rgba(0,0,0,0.02))", border: "1px solid var(--border)", padding: "10px", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "0.9rem" }}>
                  {ticket.ticket_type} · Seat {ticket.row_label}
                  {ticket.col_number}
                </strong>
                <strong style={{ color: "var(--primary-strong)" }}>{formatCurrency(ticket.price || 0)}</strong>
              </div>
              {ticket.date && (
                <span className="text-soft" style={{ fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Icon name="calendar" size={12} style={{ opacity: 0.7 }} />
                  {formatDateTime(ticket.date)}
                </span>
              )}
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
