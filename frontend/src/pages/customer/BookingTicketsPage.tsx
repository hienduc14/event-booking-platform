import { Link, useParams } from "react-router-dom";
import { getTicketsByBooking } from "../../api/tickets";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Icon } from "../../components/common/Icon";
import { PageHeader } from "../../components/common/PageHeader";
import { TicketCard } from "../../components/tickets/TicketCard";
import { useAsync } from "../../hooks/useAsync";
import type { ETicket } from "../../types/ticket";
import { formatDateTime } from "../../utils/format";

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "N/A")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function seatLabel(ticket: ETicket) {
  return `${ticket.row_label ?? ""}${ticket.col_number ?? ""}` || "N/A";
}

function downloadTickets(bookingId: number, tickets: ETicket[]) {
  const ticketItems = tickets
    .map(
      (ticket) => `
        <article class="ticket">
          <div class="qr">
            ${
              ticket.qr_code_url
                ? `<img src="${escapeHtml(ticket.qr_code_url)}" alt="QR ${escapeHtml(ticket.ticket_code)}" />`
                : `<span>QR pending</span>`
            }
          </div>
          <div class="details">
            <div class="head">
              <div>
                <p>E-ticket</p>
                <h2>${escapeHtml(ticket.ticket_code)}</h2>
              </div>
              <strong>${escapeHtml(ticket.ticket_status)}</strong>
            </div>
            <dl>
              <div><dt>Event</dt><dd>${escapeHtml(ticket.event_name || "Event")}</dd></div>
              <div><dt>Venue</dt><dd>${escapeHtml(ticket.venue_name || "Venue")}</dd></div>
              <div><dt>Seat</dt><dd>${escapeHtml(seatLabel(ticket))}</dd></div>
              <div><dt>Type</dt><dd>${escapeHtml(ticket.ticket_type || "Ticket")}</dd></div>
              <div><dt>Issued</dt><dd>${escapeHtml(formatDateTime(ticket.issued_at))}</dd></div>
            </dl>
          </div>
        </article>
      `,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Booking ${escapeHtml(bookingId)} tickets</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; background: #f7f8fc; color: #0f172a; font-family: Inter, Arial, sans-serif; }
    main { max-width: 900px; margin: 0 auto; display: grid; gap: 18px; }
    header { margin-bottom: 8px; }
    h1 { margin: 0 0 6px; font-size: 28px; }
    .meta { margin: 0; color: #5b6478; }
    .ticket { page-break-inside: avoid; display: grid; grid-template-columns: 160px 1fr; gap: 20px; padding: 20px; background: #fff; border: 1px solid #e3e7f1; border-radius: 18px; }
    .qr { min-height: 160px; display: grid; place-items: center; border: 1px dashed #cbd2e3; border-radius: 14px; background: #f1f4fb; color: #8892a6; font-weight: 700; }
    .qr img { width: 100%; height: 100%; object-fit: contain; padding: 8px; }
    .details { display: grid; gap: 14px; border-left: 1px dashed #cbd2e3; padding-left: 20px; }
    .head { display: flex; justify-content: space-between; gap: 16px; align-items: start; }
    .head p { margin: 0 0 4px; color: #6d28d9; font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    .head h2 { margin: 0; font-size: 20px; letter-spacing: .04em; }
    .head strong { border-radius: 999px; background: #ede9fe; color: #5b21b6; padding: 5px 12px; font-size: 12px; text-transform: uppercase; white-space: nowrap; }
    dl { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; }
    dt { color: #8892a6; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    dd { margin: 2px 0 0; font-weight: 700; }
    @media print { body { background: #fff; padding: 0; } .ticket { break-inside: avoid; } }
    @media (max-width: 640px) { body { padding: 16px; } .ticket { grid-template-columns: 1fr; } .details { border-left: 0; border-top: 1px dashed #cbd2e3; padding: 16px 0 0; } dl { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Booking #${escapeHtml(bookingId)} tickets</h1>
      <p class="meta">Downloaded ${escapeHtml(formatDateTime(new Date().toISOString()))}</p>
    </header>
    ${ticketItems}
  </main>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `booking-${bookingId}-tickets.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function BookingTicketsPage() {
  const bookingId = Number(useParams().bookingId);
  const { data: tickets, loading, error, reload } = useAsync(() => getTicketsByBooking(bookingId), [bookingId]);
  const hasTickets = Boolean(tickets?.length);

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow={`Booking #${bookingId}`}
        eyebrowIcon="ticket"
        title="Your e-tickets"
        description="Electronic tickets are generated after a successful payment. Save them or show the QR at the venue."
        actions={
          <>
            {hasTickets && (
              <button className="button button-primary button-sm" type="button" onClick={() => downloadTickets(bookingId, tickets!)}>
                <Icon name="ticket" size={14} />
                Download all tickets
              </button>
            )}
            <Link to="/events" className="button button-outline button-sm">
              Back to events
            </Link>
          </>
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
        <div className="booking-ticket-list">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.ticket_code} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingTicketsPage;
