import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import type { ETicket } from "../../types/ticket";
import { formatDateTime } from "../../utils/format";
import { Badge } from "../common/Badge";
import { Icon } from "../common/Icon";

export function TicketCard({ ticket }: { ticket: ETicket }) {
  const cardRef = useRef<HTMLElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2, // high quality
        backgroundColor: null, // preserve transparency/background styling
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `ticket-${ticket.ticket_code || "code"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating ticket image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <article className="ticket-card" ref={cardRef}>
      <div className="ticket-qr">
        {ticket.qr_code_url ? (
          <img src={ticket.qr_code_url} alt={`QR ${ticket.ticket_code}`} crossOrigin="anonymous" />
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
        <div
          className="row-between"
          style={{ marginTop: "0.4rem", paddingTop: "0.6rem", borderTop: "1px dashed var(--border)" }}
          data-html2canvas-ignore="true"
        >
          <span></span>
          <button
            className="button button-ghost button-sm"
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "4px 8px", height: "auto" }}
          >
            <Icon name="download" size={14} />
            {isDownloading ? "Saving..." : "Save Image"}
          </button>
        </div>
      </div>
    </article>
  );
}
