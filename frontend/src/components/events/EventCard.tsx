import { Link } from "react-router-dom";
import type { EventSummary } from "../../types/event";
import { Badge } from "../common/Badge";
import { Icon } from "../common/Icon";

export function EventCard({ event }: { event: EventSummary }) {
  const initials = event.event_name.slice(0, 2).toUpperCase();
  const days = event.number_of_days;
  return (
    <article className="event-card">
      <Link to={`/events/${event.event_id}`} className="event-card-link">
        <div className="event-card-media">
          <span className="event-card-media-badge">
            <Badge tone={event.status === "ACTIVE" ? "success" : undefined}>{event.status}</Badge>
          </span>
          {event.banner_url ? (
            <img src={event.banner_url} alt={event.event_name} loading="lazy" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="event-card-body">
          <h3 className="event-card-title">{event.event_name}</h3>
          <p className="event-card-description">
            {event.description || "Join us for an unforgettable live experience."}
          </p>
          <div className="event-card-meta">
            {days ? (
              <span className="chip">
                <Icon name="calendar" />
                {days} {days > 1 ? "days" : "day"}
              </span>
            ) : null}
            <span className="chip chip-accent">
              <Icon name="ticket" />
              E-ticket
            </span>
          </div>
          <div className="event-card-footer">
            <span className="text-muted" style={{ fontSize: "0.85rem" }}>
              Event #{event.event_id}
            </span>
            <span className="event-card-cta">
              View details <Icon name="arrow-right" size={16} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
