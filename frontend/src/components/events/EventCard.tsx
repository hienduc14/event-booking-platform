import { Link } from "react-router-dom";
import type { EventSummary } from "../../types/event";
import { Badge } from "../common/Badge";

export function EventCard({ event }: { event: EventSummary }) {
  return (
    <article className="event-card">
      <div className="event-card-media">
        {event.banner_url ? <img src={event.banner_url} alt={event.event_name} /> : <span>{event.event_name.slice(0, 2).toUpperCase()}</span>}
      </div>
      <div className="event-card-body">
        <div className="row-between">
          <h3>{event.event_name}</h3>
          <Badge>{event.status}</Badge>
        </div>
        <p>{event.description || "No description provided yet."}</p>
        <Link className="button button-secondary" to={`/events/${event.event_id}`}>
          View details
        </Link>
      </div>
    </article>
  );
}

