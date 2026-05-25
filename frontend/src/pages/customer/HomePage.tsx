import { Link } from "react-router-dom";
import { getEvents } from "../../api/events";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Button } from "../../components/common/Button";
import { EventCard } from "../../components/events/EventCard";
import { useAsync } from "../../hooks/useAsync";

function HomePage() {
  const { data: events, loading, error, reload } = useAsync(() => getEvents({ limit: 6 }), []);

  return (
    <div className="stack-lg">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Event Booking Platform</p>
          <h1>Book event tickets with a clear, reliable flow.</h1>
          <p>
            Browse active events, reserve seats, complete payment, and receive electronic tickets with QR codes.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/events">
              Browse events
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="row-between section-heading">
          <div>
            <p className="eyebrow">Upcoming</p>
            <h2>Active events</h2>
          </div>
          <Button type="button" variant="ghost" onClick={() => void reload()}>
            Refresh
          </Button>
        </div>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={() => void reload()} />}
        {!loading && !error && events?.length === 0 && <EmptyState title="No active events yet" />}
        {!loading && !error && events && events.length > 0 && (
          <div className="event-grid">
            {events.map((event) => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;

