import { Link, useParams } from "react-router-dom";
import { getEvent } from "../../api/events";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Badge } from "../../components/common/Badge";
import { Icon } from "../../components/common/Icon";
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
              {event.banner_url ? (
                <img src={event.banner_url} alt={event.event_name} />
              ) : (
                <span>{event.event_name.slice(0, 2).toUpperCase()}</span>
              )}
              <div className="detail-hero-overlay" />
            </div>
            <div className="detail-hero-content">
              <div className="detail-hero-meta">
                <Badge tone={event.status === "ACTIVE" ? "success" : undefined}>{event.status}</Badge>
                {event.number_of_days ? (
                  <span className="chip">
                    <Icon name="calendar" /> {event.number_of_days} {event.number_of_days > 1 ? "days" : "day"}
                  </span>
                ) : null}
                <span className="chip">
                  <Icon name="ticket" /> Event #{event.event_id}
                </span>
              </div>
              <h1 className="detail-hero-title">{event.event_name}</h1>
              <p className="text-muted" style={{ maxWidth: 720 }}>
                {event.description || "No description has been added for this event yet."}
              </p>
              <div className="detail-hero-actions">
                <Link className="button button-primary button-lg" to={`/events/${event.event_id}/book`}>
                  Book tickets
                  <Icon name="arrow-right" size={16} />
                </Link>
                <Link className="button button-outline" to="/events">
                  Back to events
                </Link>
              </div>
            </div>
          </section>

          <section className="section stack-md">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  <Icon name="calendar" size={14} />
                  Schedules
                </p>
                <h2>Pick a venue and show day</h2>
              </div>
            </div>

            {event.schedules.length === 0 && (
              <EmptyState
                title="No schedules available"
                description="This event has not been opened for booking yet. Please check back soon."
                icon="info"
              />
            )}

            {event.schedules.map((schedule) => (
              <article key={schedule.schedule_id} className="schedule-card surface-card">
                <div className="schedule-card-head">
                  <div className="schedule-card-venue">
                    <h3>
                      <Icon name="location" size={16} /> {schedule.venue.venue_name}
                    </h3>
                    <p className="text-muted">
                      {schedule.venue.city} · Capacity {schedule.venue.capacity.toLocaleString()}
                    </p>
                    <p className="text-soft" style={{ fontSize: "0.85rem" }}>
                      Registration · {formatDateTime(schedule.registration_start)} → {formatDateTime(schedule.registration_end)}
                    </p>
                  </div>
                  <Link className="button button-primary button-sm" to={`/events/${event.event_id}/book`}>
                    Select seats
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </div>

                <div className="schedule-card-section">
                  <h4>
                    <Icon name="ticket" size={14} /> Ticket types
                  </h4>
                  <div className="ticket-config-list">
                    {schedule.ticket_configs.map((config) => (
                      <div key={config.config_id} className="ticket-config-row">
                        <div className="stack-xs">
                          <strong>{config.ticket_type}</strong>
                          <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                            {config.remaining_quantity ?? 0} of {config.max_quantity} remaining
                          </span>
                        </div>
                        <strong style={{ color: "var(--primary-strong)", fontSize: "1.05rem" }}>
                          {formatCurrency(config.price)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="schedule-card-section">
                  <h4>
                    <Icon name="calendar" size={14} /> Show days
                  </h4>
                  <div className="ticket-config-list">
                    {schedule.event_days.map((day) => (
                      <div key={day.event_day_id} className="ticket-config-row">
                        <strong>{formatDateTime(day.date)}</strong>
                        <span className="chip chip-accent">
                          <Icon name="users" />
                          {day.available_tickets.length} seats available
                        </span>
                      </div>
                    ))}
                  </div>
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
