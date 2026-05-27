import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTicketByCode } from "../../api/tickets";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/common/Icon";
import { PageHeader } from "../../components/common/PageHeader";
import { TicketCard } from "../../components/tickets/TicketCard";
import { useAsync } from "../../hooks/useAsync";

function TicketDetailPage() {
  const ticketCode = useParams().ticketCode || "";
  const isLookup = ticketCode === "lookup";
  const navigate = useNavigate();
  const [lookupValue, setLookupValue] = useState("");

  const { data: ticket, loading, error, reload } = useAsync(() => getTicketByCode(ticketCode), [ticketCode]);

  if (isLookup) {
    return (
      <div className="stack-lg">
        <PageHeader
          eyebrow="Ticket lookup"
          eyebrowIcon="search"
          title="Find your e-ticket"
          description="Enter a ticket code to view its details, status, and QR code."
        />
        <section className="panel stack-md">
          <form
            className="lookup-form"
            onSubmit={(formEvent) => {
              formEvent.preventDefault();
              const trimmed = lookupValue.trim();
              if (!trimmed) return;
              navigate(`/tickets/${encodeURIComponent(trimmed)}`);
            }}
          >
            <div className="search-field" style={{ flex: "1 1 280px" }}>
              <Icon name="search" />
              <input
                value={lookupValue}
                onChange={(formEvent) => setLookupValue(formEvent.target.value)}
                placeholder="e.g. EVT-2026-000123"
                aria-label="Ticket code"
              />
            </div>
            <Button type="submit" size="md" disabled={!lookupValue.trim()}>
              Look up
              <Icon name="arrow-right" size={14} />
            </Button>
          </form>
          <p className="text-soft" style={{ fontSize: "0.88rem" }}>
            Tip: you can also paste the URL <code>/tickets/&lt;ticket-code&gt;</code> directly in your browser.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow="Ticket"
        eyebrowIcon="ticket"
        title="Ticket detail"
        description={ticketCode}
      />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={() => void reload()} />}
      {ticket && <TicketCard ticket={ticket} />}
    </div>
  );
}

export default TicketDetailPage;
