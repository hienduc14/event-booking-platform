import { Link } from "react-router-dom";
import type { EventSummary } from "../types/event";

const events: EventSummary[] = [
  { id: 1, code: "EVT001", name: "Music Festival", description: "A live music experience." },
  { id: 2, code: "EVT002", name: "Art Show", description: "A curated art exhibition." },
];

function EventList() {
  return (
    <section>
      <h2>Upcoming events</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <Link to={`/events/${event.id}`}>
              <strong>{event.name}</strong> ({event.code})
            </Link>
            <p>{event.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default EventList;
