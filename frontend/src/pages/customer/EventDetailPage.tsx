import { Link, useParams } from "react-router-dom";
import { getEvent } from "../../api/events";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Badge } from "../../components/common/Badge";
import { PageHeader } from "../../components/common/PageHeader";
import { useAsync } from "../../hooks/useAsync";
import { formatDateTime } from "../../utils/format";

function EventDetailPage() {
  const eventId = Number(useParams().eventId);
  const { data: event, loading, error, reload } = useAsync(() => getEvent(eventId), [eventId]);

  if (!eventId) {
    return <EmptyState title="Invalid event" description="The event id in the URL is not valid." />;
  }

  return (
    <div className="stack-lg">
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={() => void reload()} />}
      {event && (
        <>
          <section className="detail-hero">
            <div className="detail-hero-media">
              {event.banner_url ? <img src={event.banner_url} alt={event.event_name} /> : <span>{event.event_name.slice(0, 2).toUpperCase()}</span>}
            </div>
            <div className="detail-hero-content">
              <Badge>{event.status}</Badge>
              <h1>{event.event_name}</h1>
              <p>{event.description || "No description has been added for this event."}</p>
              <p className="muted">Created {formatDateTime(event.created_at)}</p>
              <Link className="button button-primary" to={`/events/${event.event_id}/book`}>
                Book tickets
              </Link>
            </div>
          </section>

          <section className="section notice-panel">
            <PageHeader
              title="Schedule and ticket setup"
              description="The backend currently returns basic event details only. Until event detail includes schedules, days, ticket configs and remaining quantity, the booking page accepts these IDs manually for demo purposes."
            />
          </section>
        </>
      )}
    </div>
  );
}

export default EventDetailPage;

