import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEvent } from "../../api/events";
import { createReservation } from "../../api/reservations";
import { BookingSummary } from "../../components/booking/BookingSummary";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/common/Icon";
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
        eyebrowIcon="music"
        title="Reserve your tickets"
        description="Fill in your contact details, pick a schedule and show day, then choose the seats you want."
      />
      {loading && <LoadingState />}
      {loadError && <ErrorState message={loadError} onRetry={() => void reload()} />}
      {event && (
        <div className="two-column">
          <form className="panel form-grid" onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}

            <h2 className="form-section-title">
              <span className="form-section-index">1</span>
              Contact information
            </h2>
            <label>
              Full name
              <input
                required
                value={form.customer_name}
                onChange={(eventValue) => setField("customer_name", eventValue.target.value)}
                placeholder="e.g. Nguyễn Văn A"
              />
            </label>
            <label>
              Phone
              <input
                required
                value={form.phone}
                onChange={(eventValue) => setField("phone", eventValue.target.value)}
                placeholder="0901 234 567"
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(eventValue) => setField("email", eventValue.target.value)}
                placeholder="you@email.com"
              />
            </label>
            <label>
              Refund payment account
              <input
                required
                value={form.payment_account}
                onChange={(eventValue) => setField("payment_account", eventValue.target.value)}
                placeholder="Bank account or e-wallet"
              />
            </label>

            <h2 className="form-section-title">
              <span className="form-section-index">2</span>
              Schedule &amp; show day
            </h2>
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
              <div className="full-span">
                <div className="ticket-config-list">
                  <p className="text-soft" style={{ fontSize: "0.85rem" }}>
                    Registration window: {formatDateTime(selectedSchedule.registration_start)} →{" "}
                    {formatDateTime(selectedSchedule.registration_end)}
                  </p>
                  {selectedSchedule.ticket_configs.map((config) => (
                    <div key={config.config_id} className="ticket-config-row">
                      <strong>{config.ticket_type}</strong>
                      <span>
                        <strong style={{ color: "var(--primary-strong)" }}>
                          {formatCurrency(config.price)}
                        </strong>
                        <span className="text-muted" style={{ marginLeft: 12, fontSize: "0.85rem" }}>
                          {config.remaining_quantity ?? 0} left
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 className="form-section-title">
              <span className="form-section-index">3</span>
              Choose your seats
            </h2>
            <div className="full-span">
              <div className="row-between" style={{ marginBottom: "0.75rem" }}>
                <span className="text-muted" style={{ fontSize: "0.92rem" }}>
                  Tap a seat to select. Selected seats appear in the summary on the right.
                </span>
                <span className="chip">
                  <Icon name="users" /> {selectedDay?.available_tickets.length || 0} available
                </span>
              </div>
              {!selectedDay || selectedDay.available_tickets.length === 0 ? (
                <EmptyState
                  title="No available seats"
                  description="Choose another day or wait for the admin team to open inventory."
                  icon="info"
                />
              ) : (
                <div className="seat-grid">
                  {selectedDay.available_tickets.map((ticket) => {
                    const active = form.ticket_ids.includes(ticket.ticket_id);
                    return (
                      <button
                        key={ticket.ticket_id}
                        type="button"
                        className={`seat-tile${active ? " seat-tile-active" : ""}`}
                        onClick={() => toggleSeat(ticket.ticket_id)}
                      >
                        <span className="seat-tile-label">
                          {ticket.row_label}
                          {ticket.col_number}
                        </span>
                        <span className="seat-tile-meta">
                          {ticket.ticket_type || "Seat"} · {formatCurrency(ticket.price || 0)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="full-span">
              <Button
                type="submit"
                size="lg"
                disabled={submitting || form.ticket_ids.length === 0}
                style={{ width: "100%" }}
              >
                {submitting
                  ? "Creating reservation..."
                  : form.ticket_ids.length === 0
                  ? "Select at least one seat"
                  : `Reserve ${form.ticket_ids.length} seat${form.ticket_ids.length > 1 ? "s" : ""}`}
                {!submitting && form.ticket_ids.length > 0 && <Icon name="arrow-right" size={16} />}
              </Button>
            </div>
          </form>

          <BookingSummary schedule={selectedSchedule} eventDay={selectedDay} selectedTickets={selectedTickets} />
        </div>
      )}
    </div>
  );
}

export default BookingPage;
