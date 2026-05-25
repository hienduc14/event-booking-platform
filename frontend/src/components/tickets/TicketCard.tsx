import type { ETicket } from "../../types/ticket";
import { formatDateTime } from "../../utils/format";
import { Badge } from "../common/Badge";
import { Icon } from "../common/Icon";

export function TicketCard({ ticket }: { ticket: ETicket }) {
  return (
    <article className="ticket-card">
      <div className="ticket-qr">
        {ticket.qr_code_url ? (
          <img src={ticket.qr_code_url} alt={`QR ${ticket.ticket_code}`} />
        ) : (
          <div className="stack-xs text-center">
            <Icon name="qr" size={48} />
            <span style={{ fontSize: "0.78rem" }}>QR pending</span>
          </div>
        )}
      </div>
      <div className="ticket-body">
        <div className="row-between">
          <div>
            <p className="eyebrow" style={{ marginBottom: 4 }}>
              <Icon name="ticket" size={12} />
              E-ticket
            </p>
            <h3>{ticket.ticket_code}</h3>
          </div>
          <Badge>{ticket.ticket_status}</Badge>
        </div>
        <div className="ticket-body-row">
          <span>
            <Icon name="music" size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            <strong>{ticket.event_name || "Event"}</strong>
          </span>
          <span>
            <Icon name="location" size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            {ticket.venue_name || "Venue"}
          </span>
        </div>
        <div className="ticket-body-row">
          <span>
            Seat <strong>{ticket.row_label}{ticket.col_number}</strong>
          </span>
          <span>
            Type <strong>{ticket.ticket_type || "Ticket"}</strong>
          </span>
        </div>
        <div className="ticket-body-row text-soft" style={{ fontSize: "0.85rem" }}>
          <span>
            <Icon name="calendar" size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            Issued {formatDateTime(ticket.issued_at)}
          </span>
        </div>
      </div>
    </article>
  );
}
