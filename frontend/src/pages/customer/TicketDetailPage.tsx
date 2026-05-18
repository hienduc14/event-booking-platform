import { useParams } from "react-router-dom";
import { getTicketByCode } from "../../api/tickets";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { PageHeader } from "../../components/common/PageHeader";
import { TicketCard } from "../../components/tickets/TicketCard";
import { useAsync } from "../../hooks/useAsync";

function TicketDetailPage() {
  const ticketCode = useParams().ticketCode || "";
  const isLookup = ticketCode === "lookup";
  const { data: ticket, loading, error, reload } = useAsync(() => getTicketByCode(ticketCode), [ticketCode]);

  if (isLookup) {
    return (
      <div className="stack-lg">
        <PageHeader title="Ticket lookup" description="Enter a ticket code directly in the URL: /tickets/{ticketCode}." />
        <EmptyState title="Ticket code required" description="This placeholder keeps navigation simple until a lookup form is added." />
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <PageHeader title="Ticket detail" description={ticketCode} />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={() => void reload()} />}
      {ticket && <TicketCard ticket={ticket} />}
    </div>
  );
}

export default TicketDetailPage;
