import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEvent } from "../../api/events";
import { createReservation } from "../../api/reservations";
import { BookingSummary } from "../../components/booking/BookingSummary";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAsync } from "../../hooks/useAsync";
import type { ReservationRequest } from "../../types/booking";
import type { EventDay, EventSchedule, EventSeat } from "../../types/event";
import { formatCurrency, formatDateTime } from "../../utils/format";

function BookingPage() {
  const eventId = Number(useParams().eventId);
  const navigate = useNavigate();
  const { data: event, loading, error: loadError, reload } = useAsync(() => getEvent(eventId), [eventId]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ReservationRequest>({
    customer_name: "",
    phone: "",
    email: "",
    payment_account: "",
    schedule_id: 0,
    event_day_id: 0,
    ticket_ids: [],
  });

  useEffect(() => {
    if (!event || event.schedules.length === 0 || form.schedule_id) return;
    const firstSchedule = event.schedules[0];
    const firstDay = firstSchedule.event_days[0];
    setForm((prev) => ({
      ...prev,
      schedule_id: firstSchedule.schedule_id,
      event_day_id: firstDay?.event_day_id || 0,
      ticket_ids: [],
    }));
  }, [event, form.schedule_id]);

  const selectedSchedule = useMemo<EventSchedule | null>(
    () => event?.schedules.find((schedule) => schedule.schedule_id === form.schedule_id) || null,
    [event, form.schedule_id],
  );
  const selectedDay = useMemo<EventDay | null>(
    () => selectedSchedule?.event_days.find((day) => day.event_day_id === form.event_day_id) || null,
    [selectedSchedule, form.event_day_id],
  );
  const selectedTickets = useMemo<EventSeat[]>(
    () => (selectedDay?.available_tickets || []).filter((ticket) => form.ticket_ids.includes(ticket.ticket_id)),
    [selectedDay, form.ticket_ids],
  );

  function setField<K extends keyof ReservationRequest>(field: K, value: ReservationRequest[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function changeSchedule(scheduleId: number) {
    const schedule = event?.schedules.find((item) => item.schedule_id === scheduleId) || null;
    setForm((prev) => ({
      ...prev,
      schedule_id: scheduleId,
      event_day_id: schedule?.event_days[0]?.event_day_id || 0,
      ticket_ids: [],
    }));
  }

  function changeDay(dayId: number) {
    setForm((prev) => ({ ...prev, event_day_id: dayId, ticket_ids: [] }));
  }

  function toggleSeat(ticketId: number) {
    setForm((prev) => ({
      ...prev,
      ticket_ids: prev.ticket_ids.includes(ticketId)
        ? prev.ticket_ids.filter((id) => id !== ticketId)
        : [...prev.ticket_ids, ticketId],
    }));
  }

  async function handleSubmit(eventValue: React.FormEvent<HTMLFormElement>) {
    eventValue.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const booking = await createReservation(form);
      navigate(`/checkout/${booking.booking_id}`, { state: { booking } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create reservation");
    } finally {
      setSubmitting(false);
    }
  }

  if (!eventId) {
    return <EmptyState title="Invalid event" description="The event id in the URL is not valid." />;
  }

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow={event ? event.event_name : `Event #${eventId}`}
        title="Reserve tickets"
        description="Choose a schedule, select a performance day, then reserve available seats created from the admin seat layout."
      />
      {loading && <LoadingState />}
      {loadError && <ErrorState message={loadError} onRetry={() => void reload()} />}
      {event && (
        <div className="two-column">
          <form className="panel form-grid" onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}
            <label>
              Full name
              <input required value={form.customer_name} onChange={(eventValue) => setField("customer_name", eventValue.target.value)} />
            </label>
            <label>
              Phone
              <input required value={form.phone} onChange={(eventValue) => setField("phone", eventValue.target.value)} />
            </label>
            <label>
              Email
              <input required type="email" value={form.email} onChange={(eventValue) => setField("email", eventValue.target.value)} />
            </label>
            <label>
              Refund payment account
              <input required value={form.payment_account} onChange={(eventValue) => setField("payment_account", eventValue.target.value)} />
            </label>

            <label>
              Schedule
              <select value={form.schedule_id} onChange={(eventValue) => changeSchedule(Number(eventValue.target.value))}>
                {event.schedules.map((schedule) => (
                  <option key={schedule.schedule_id} value={schedule.schedule_id}>
                    {schedule.venue.venue_name} ({schedule.venue.city})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Performance day
              <select value={form.event_day_id} onChange={(eventValue) => changeDay(Number(eventValue.target.value))}>
                {(selectedSchedule?.event_days || []).map((day) => (
                  <option key={day.event_day_id} value={day.event_day_id}>
                    {formatDateTime(day.date)}
                  </option>
                ))}
              </select>
            </label>

            {selectedSchedule && (
              <div className="panel" style={{ gridColumn: "1 / -1" }}>
                <div className="stack-sm">
                  <p className="muted">
                    Registration window: {formatDateTime(selectedSchedule.registration_start)} to {formatDateTime(selectedSchedule.registration_end)}
                  </p>
                  <div className="summary-list">
                    {selectedSchedule.ticket_configs.map((config) => (
                      <div key={config.config_id} className="summary-row">
                        <span>{config.ticket_type}</span>
                        <strong>
                          {formatCurrency(config.price)} • {config.remaining_quantity ?? 0} seats left
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="panel" style={{ gridColumn: "1 / -1" }}>
              <div className="row-between">
                <h2>Available seats</h2>
                <span className="muted">{selectedDay?.available_tickets.length || 0} seats available</span>
              </div>
              {!selectedDay || selectedDay.available_tickets.length === 0 ? (
                <EmptyState title="No available seats" description="Choose another day or wait for the admin team to open inventory." />
              ) : (
                <div className="summary-list">
                  {selectedDay.available_tickets.map((ticket) => {
                    const active = form.ticket_ids.includes(ticket.ticket_id);
                    return (
                      <button
                        key={ticket.ticket_id}
                        type="button"
                        className={`button ${active ? "button-primary" : "button-secondary"}`}
                        onClick={() => toggleSeat(ticket.ticket_id)}
                        style={{ justifyContent: "space-between" }}
                      >
                        <span>
                          {ticket.ticket_type} • Seat {ticket.row_label}
                          {ticket.col_number}
                        </span>
                        <strong>{formatCurrency(ticket.price || 0)}</strong>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Button type="submit" disabled={submitting || form.ticket_ids.length === 0}>
              {submitting ? "Creating reservation..." : "Create reservation"}
            </Button>
          </form>

          <BookingSummary schedule={selectedSchedule} eventDay={selectedDay} selectedTickets={selectedTickets} />
        </div>
      )}
    </div>
  );
}

export default BookingPage;
