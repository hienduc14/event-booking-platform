import { useState } from "react";
import { useParams } from "react-router-dom";
import { createEventDay, createSchedule, createTicketConfig } from "../../api/events";
import { assignArtist } from "../../api/admin";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";

function AdminEventSetupPage() {
  const eventId = Number(useParams().eventId);
  const { token } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduleVenueId, setScheduleVenueId] = useState(0);
  const [dayScheduleId, setDayScheduleId] = useState(0);
  const [dayDate, setDayDate] = useState("");
  const [config, setConfig] = useState({ schedule_id: 0, ticket_type: "STANDARD", price: 0, max_quantity: 1 });
  const [assignment, setAssignment] = useState({ event_day_id: 0, artist_id: 0, is_backup: false });

  async function run(action: () => Promise<unknown>, success: string) {
    if (!token) return;
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(success);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title={`Setup event #${eventId}`}
        description="Create schedule, event day, ticket config and artist assignment. Read/list setup APIs are still backend TODOs, so this page focuses on creation forms."
      />
      {message && <div className="success-box">{message}</div>}
      {error && <div className="form-error">{error}</div>}
      <div className="setup-grid">
        <section className="panel form-grid">
          <h2>Create schedule</h2>
          <label>
            Venue ID
            <input type="number" min={1} value={scheduleVenueId || ""} onChange={(event) => setScheduleVenueId(Number(event.target.value))} />
          </label>
          <Button type="button" onClick={() => void run(() => createSchedule({ event_id: eventId, venue_id: scheduleVenueId }, token || ""), "Schedule created")}>
            Create schedule
          </Button>
        </section>

        <section className="panel form-grid">
          <h2>Create event day</h2>
          <label>
            Schedule ID
            <input type="number" min={1} value={dayScheduleId || ""} onChange={(event) => setDayScheduleId(Number(event.target.value))} />
          </label>
          <label>
            Date
            <input type="datetime-local" value={dayDate} onChange={(event) => setDayDate(event.target.value)} />
          </label>
          <Button type="button" onClick={() => void run(() => createEventDay({ schedule_id: dayScheduleId, date: new Date(dayDate).toISOString() }, token || ""), "Event day created")}>
            Create day
          </Button>
        </section>

        <section className="panel form-grid">
          <h2>Create ticket config</h2>
          <label>
            Schedule ID
            <input type="number" min={1} value={config.schedule_id || ""} onChange={(event) => setConfig((prev) => ({ ...prev, schedule_id: Number(event.target.value) }))} />
          </label>
          <label>
            Ticket type
            <input value={config.ticket_type} onChange={(event) => setConfig((prev) => ({ ...prev, ticket_type: event.target.value }))} />
          </label>
          <label>
            Price
            <input type="number" min={0} value={config.price} onChange={(event) => setConfig((prev) => ({ ...prev, price: Number(event.target.value) }))} />
          </label>
          <label>
            Max quantity
            <input type="number" min={1} value={config.max_quantity} onChange={(event) => setConfig((prev) => ({ ...prev, max_quantity: Number(event.target.value) }))} />
          </label>
          <Button type="button" onClick={() => void run(() => createTicketConfig(config, token || ""), "Ticket config created")}>
            Create config
          </Button>
        </section>

        <section className="panel form-grid">
          <h2>Assign artist</h2>
          <label>
            Event day ID
            <input type="number" min={1} value={assignment.event_day_id || ""} onChange={(event) => setAssignment((prev) => ({ ...prev, event_day_id: Number(event.target.value) }))} />
          </label>
          <label>
            Artist ID
            <input type="number" min={1} value={assignment.artist_id || ""} onChange={(event) => setAssignment((prev) => ({ ...prev, artist_id: Number(event.target.value) }))} />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={assignment.is_backup} onChange={(event) => setAssignment((prev) => ({ ...prev, is_backup: event.target.checked }))} />
            Backup artist
          </label>
          <Button type="button" onClick={() => void run(() => assignArtist(assignment, token || ""), "Artist assigned")}>
            Assign artist
          </Button>
        </section>
      </div>
    </div>
  );
}

export default AdminEventSetupPage;
