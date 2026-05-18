import { useMemo, useState } from "react";
import { getEvents } from "../../api/events";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { PageHeader } from "../../components/common/PageHeader";
import { EventCard } from "../../components/events/EventCard";
import { useAsync } from "../../hooks/useAsync";

function EventListPage() {
  const [query, setQuery] = useState("");
  const { data: events, loading, error, reload } = useAsync(() => getEvents({ limit: 100 }), []);

  const filteredEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!events || !normalized) return events ?? [];
    return events.filter((event) => event.event_name.toLowerCase().includes(normalized));
  }, [events, query]);

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow="Customer"
        title="Browse events"
        description="Choose an active event and continue to the booking flow."
      />
      <div className="toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by event name" />
        <button type="button" className="button button-secondary" onClick={() => void reload()}>
          Refresh
        </button>
      </div>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={() => void reload()} />}
      {!loading && !error && filteredEvents.length === 0 && <EmptyState title="No events match your search" />}
      {!loading && !error && filteredEvents.length > 0 && (
        <div className="event-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventListPage;

