import type { ETicket } from "../../types/ticket";
import { formatDateTime } from "../../utils/format";
import { Badge } from "../common/Badge";

export function TicketCard({ ticket }: { ticket: ETicket }) {
  return (
    <article className="ticket-card">
      <div className="ticket-qr">
        {ticket.qr_code_url ? <img src={ticket.qr_code_url} alt={`QR ${ticket.ticket_code}`} /> : <span>No QR</span>}
      </div>
      <div>
        <div className="row-between">
          <h3>{ticket.ticket_code}</h3>
          <Badge>{ticket.ticket_status}</Badge>
        </div>
        <p>
          {ticket.event_name || "Event"} • {ticket.venue_name || "Venue"}
        </p>
        <p>
          Seat {ticket.row_label}
          {ticket.col_number} • {ticket.ticket_type || "Ticket"}
        </p>
        <p>Issued at {formatDateTime(ticket.issued_at)}</p>
      </div>
    </article>
  );
}

