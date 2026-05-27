import { useMemo, useState } from "react";
import { getEvents } from "../../api/events";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Icon } from "../../components/common/Icon";
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
        eyebrow="Browse"
        eyebrowIcon="music"
        title="All events"
        description="Find the concert or show that matches your vibe. Search by name and continue to booking in a few clicks."
        actions={
          <button type="button" className="button button-outline button-sm" onClick={() => void reload()}>
            Refresh
          </button>
        }
      />

      <div className="toolbar">
        <div className="search-field">
          <Icon name="search" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events by name…"
            aria-label="Search events by name"
          />
        </div>
        {!loading && !error && events && (
          <span className="result-count">
            {filteredEvents.length} of {events.length} events
          </span>
        )}
      </div>

      {loading && <LoadingState variant="card" skeletonCount={6} />}
      {error && <ErrorState message={error} onRetry={() => void reload()} />}
      {!loading && !error && filteredEvents.length === 0 && (
        <EmptyState
          title="No events match your search"
          description="Try a different keyword or clear the search to see all available events."
          icon="search"
        />
      )}
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
