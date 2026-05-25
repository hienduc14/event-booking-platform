import { Link, useParams } from "react-router-dom";
import { getEvent } from "../../api/events";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Badge } from "../../components/common/Badge";
import { PageHeader } from "../../components/common/PageHeader";
import { useAsync } from "../../hooks/useAsync";
import { formatCurrency, formatDateTime } from "../../utils/format";

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
              <Link className="button button-primary" to={`/events/${event.event_id}/book`}>
                Book tickets
              </Link>
            </div>
          </section>

          <section className="section stack-md">
            <PageHeader title="Schedules" description="Customer bookings now use the seat inventory configured in the separate admin project." />
            {event.schedules.length === 0 && (
              <EmptyState title="No schedules available" description="This event has not been opened for booking yet." />
            )}
            {event.schedules.map((schedule) => (
              <article key={schedule.schedule_id} className="panel stack-sm">
                <div className="row-between">
                  <div>
                    <h3>{schedule.venue.venue_name}</h3>
                    <p className="muted">
                      {schedule.venue.city} • Capacity {schedule.venue.capacity}
                    </p>
                  </div>
                  <Link className="button button-secondary" to={`/events/${event.event_id}/book`}>
                    Select seats
                  </Link>
                </div>
                <p className="muted">
                  Registration: {formatDateTime(schedule.registration_start)} to {formatDateTime(schedule.registration_end)}
                </p>
                <div className="summary-list">
                  {schedule.ticket_configs.map((config) => (
                    <div key={config.config_id} className="summary-row">
                      <span>{config.ticket_type}</span>
                      <strong>
                        {formatCurrency(config.price)} • {config.remaining_quantity ?? 0} seats left
                      </strong>
                    </div>
                  ))}
                </div>
                <div className="summary-list">
                  {schedule.event_days.map((day) => (
                    <div key={day.event_day_id} className="summary-row">
                      <span>{formatDateTime(day.date)}</span>
                      <strong>{day.available_tickets.length} seats available</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

export default EventDetailPage;
