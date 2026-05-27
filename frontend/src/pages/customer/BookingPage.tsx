import { Fragment, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  const location = useLocation();
  const { data: event, loading, error: loadError, reload } = useAsync(() => getEvent(eventId), [eventId]);
  const selectedScheduleIdFromState = (location.state as { selectedScheduleId?: number } | null)?.selectedScheduleId;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ReservationRequest>({
    customer_name: "",
    phone: "",
    email: "",
    schedule_id: 0,
    event_day_id: 0,
    ticket_ids: [],
  });

  useEffect(() => {
    if (!event || event.schedules.length === 0 || form.schedule_id) return;
    const preferredSchedule =
      event.schedules.find((schedule) => schedule.schedule_id === selectedScheduleIdFromState) || event.schedules[0];
    const firstDay = preferredSchedule.event_days[0];
    setForm((prev) => ({
      ...prev,
      schedule_id: preferredSchedule.schedule_id,
      event_day_id: firstDay?.event_day_id || 0,
      ticket_ids: [],
    }));
  }, [event, form.schedule_id, selectedScheduleIdFromState]);

  const selectedSchedule = useMemo<EventSchedule | null>(
    () => event?.schedules.find((schedule) => schedule.schedule_id === form.schedule_id) || null,
    [event, form.schedule_id],
  );
  const selectedDay = useMemo<EventDay | null>(
    () => selectedSchedule?.event_days.find((day) => day.event_day_id === form.event_day_id) || null,
    [selectedSchedule, form.event_day_id],
  );
  const selectedTickets = useMemo<(EventSeat & { date?: string })[]>(() => {
    if (!selectedSchedule) return [];
    const list: (EventSeat & { date?: string })[] = [];
    for (const day of selectedSchedule.event_days || []) {
      const daySeats = day.seats || [];
      for (const seat of daySeats) {
        if (form.ticket_ids.includes(seat.ticket_id)) {
          list.push({ ...seat, date: day.date });
        }
      }
    }
    return list;
  }, [selectedSchedule, form.ticket_ids]);
  const seatRows = useMemo(
    () => Array.from(new Set((selectedDay?.seats || []).map((ticket) => ticket.row_label).filter(Boolean) as string[])).sort(),
    [selectedDay],
  );
  const seatCols = useMemo(
    () =>
      Array.from(new Set((selectedDay?.seats || []).map((ticket) => ticket.col_number).filter((value): value is number => typeof value === "number"))).sort(
        (a, b) => a - b,
      ),
    [selectedDay],
  );
  const seatMap = useMemo(() => {
    const map = new Map<string, EventSeat>();
    for (const ticket of selectedDay?.seats || []) {
      map.set(`${ticket.row_label}-${ticket.col_number}`, ticket);
    }
    return map;
  }, [selectedDay]);
  const availableSeatCount = useMemo(
    () => (selectedDay?.seats || []).filter((ticket) => ticket.ticket_status === "Available").length,
    [selectedDay],
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
    setForm((prev) => ({ ...prev, event_day_id: dayId }));
  }

  function toggleSeat(ticketId: number) {
    setForm((prev) => ({
      ...prev,
      ticket_ids: prev.ticket_ids.includes(ticketId)
        ? prev.ticket_ids.filter((id) => id !== ticketId)
        : [...prev.ticket_ids, ticketId],
    }));
  }

  function getSeatTone(ticket: EventSeat, active: boolean) {
    if (active) return "user-seat-slot-selected";

    switch (ticket.ticket_status) {
      case "Available":
        switch ((ticket.ticket_type || "").toLowerCase()) {
          case "special":
            return "user-seat-slot-special";
          case "vip":
            return "user-seat-slot-vip";
          default:
            return "user-seat-slot-normal";
        }
      case "Holding":
        return "user-seat-slot-holding";
      case "Valid":
        return "user-seat-slot-valid";
      case "Used":
        return "user-seat-slot-used";
      case "Canceled":
      case "Cancelled":
        return "user-seat-slot-cancelled";
      case "Reserved":
        return "user-seat-slot-reserved";
      case "Refunded":
        return "user-seat-slot-refunded";
      default:
        return "user-seat-slot-unavailable";
    }
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
        description="Choose a schedule, select a performance day, then reserve seats from the full seat map."
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
              Venue
              <select value={form.schedule_id} onChange={(eventValue) => changeSchedule(Number(eventValue.target.value))}>
                {event.schedules.map((schedule) => (
                  <option key={schedule.schedule_id} value={schedule.schedule_id}>
                    {schedule.venue.venue_name} ({schedule.venue.city})
                  </option>
                ))}
              </select>
            </label>
            <div className="full-span" style={{ marginBottom: "0.5rem" }}>
              <span className="muted" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "600" }}>Performance day</span>
              <div className="day-tabs-container" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {(selectedSchedule?.event_days || []).map((day) => {
                  const isSelected = day.event_day_id === form.event_day_id;
                  const selectedCount = (day.seats || []).filter((seat) => form.ticket_ids.includes(seat.ticket_id)).length;
                  return (
                    <button
                      key={day.event_day_id}
                      type="button"
                      className={`day-tab-btn ${isSelected ? "active" : ""}`}
                      onClick={() => changeDay(day.event_day_id)}
                      style={{
                        padding: "0.75rem 1.25rem",
                        borderRadius: "8px",
                        border: isSelected ? "2px solid var(--primary-strong)" : "1px solid var(--border)",
                        background: isSelected ? "var(--primary-subtle, rgba(239, 68, 68, 0.1))" : "var(--panel-bg)",
                        color: isSelected ? "var(--primary-strong)" : "var(--text-main)",
                        cursor: "pointer",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Icon name="calendar" size={14} />
                      {formatDateTime(day.date)}
                      {selectedCount > 0 && (
                        <span
                          className="day-seat-count-badge"
                          style={{
                            background: "var(--primary)",
                            color: "#fff",
                            fontSize: "0.75rem",
                            borderRadius: "12px",
                            padding: "2px 8px",
                            fontWeight: "700",
                          }}
                        >
                          {selectedCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSchedule && (
              <div className="full-span">
                <div className="ticket-config-list">
                  <p className="text-soft" style={{ fontSize: "0.85rem" }}>
                    Registration window: {formatDateTime(selectedSchedule.registration_start)} →{" "}
                    {formatDateTime(selectedSchedule.registration_end)}
                  </p>
                  {selectedSchedule.ticket_configs.map((config) =>
                    config.ticket_type !== "vip" ? (
                      <div key={config.config_id} className="ticket-config-row">
                        <strong>{config.ticket_type}</strong>
                        <span>
                          <strong style={{ color: "var(--primary-strong)" }}>
                            {formatCurrency(config.price)}
                          </strong>
                          <span
                            className="text-muted"
                            style={{ marginLeft: 12, fontSize: "0.85rem" }}
                          >
                            {config.remaining_quantity ?? 0} left
                          </span>
                        </span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            <div className="panel" style={{ gridColumn: "1 / -1" }}>
              <div className="row-between">
                <h2>Seat map</h2>
                <span className="muted">
                  {selectedDay?.seats.length || 0} seats total • {availableSeatCount} available
                </span>
              </div>
              {!selectedDay || selectedDay.seats.length === 0 ? (
                <EmptyState title="No seat map available" description="Choose another day or wait for the admin team to open inventory." />
              ) : seatRows.length > 0 && seatCols.length > 0 ? (
                <div className="user-seat-map-wrapper">
                  <div className="user-seat-legend">
                    <span className="user-seat-legend-item"><i className="user-seat-legend-dot user-seat-slot-normal" /> Normal available</span>
                    <span className="user-seat-legend-item"><i className="user-seat-legend-dot user-seat-slot-special" /> Special available</span>
                    <span className="user-seat-legend-item"><i className="user-seat-legend-dot user-seat-slot-vip" /> VIP / invite</span>
                    <span className="user-seat-legend-item"><i className="user-seat-legend-dot user-seat-slot-holding" /> Holding</span>
                    <span className="user-seat-legend-item"><i className="user-seat-legend-dot user-seat-slot-valid" /> Sold</span>
                    <span className="user-seat-legend-item"><i className="user-seat-legend-dot user-seat-slot-used" /> Used</span>
                    <span className="user-seat-legend-item"><i className="user-seat-legend-dot user-seat-slot-selected" /> Selected</span>
                  </div>
                  <div className="user-seat-map" style={{ gridTemplateColumns: `48px repeat(${seatCols.length}, minmax(48px, 1fr))` }}>
                    <div />
                    {seatCols.map((col) => (
                      <div key={`seat-col-${col}`} className="user-seat-axis">
                        {col}
                      </div>
                    ))}
                    {seatRows.map((row) => (
                      <Fragment key={`seat-row-${row}`}>
                        <div className="user-seat-axis">{row}</div>
                        {seatCols.map((col) => {
                          const ticket = seatMap.get(`${row}-${col}`);
                          if (!ticket) {
                            return <div key={`empty-${row}-${col}`} className="user-seat-slot user-seat-slot-empty" />;
                          }
                          const active = form.ticket_ids.includes(ticket.ticket_id);
                          const canToggle = ticket.ticket_status === "Available";
                          return (
                            <button
                              key={`seat-${ticket.ticket_id}`}
                              type="button"
                              className={`user-seat-slot ${getSeatTone(ticket, active)}`}
                              onClick={() => canToggle && toggleSeat(ticket.ticket_id)}
                              disabled={!canToggle}
                              title={`${ticket.ticket_type} seat ${row}${col} - ${ticket.ticket_status} - ${formatCurrency(ticket.price || 0)}`}
                            >
                              <span>{row}{col}</span>
                              <small>{ticket.ticket_type}</small>
                            </button>
                          );
                        })}
                      </Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="summary-list">
                  {selectedDay.seats.map((ticket) => {
                    const active = form.ticket_ids.includes(ticket.ticket_id);
                    const canToggle = ticket.ticket_status === "Available";
                    return (
                      <button
                        key={ticket.ticket_id}
                        type="button"
                        className={`button ${active ? "button-primary" : "button-secondary"}`}
                        onClick={() => canToggle && toggleSeat(ticket.ticket_id)}
                        disabled={!canToggle}
                        style={{ justifyContent: "space-between" }}
                      >
                        <span>
                          {ticket.ticket_type} • Seat {ticket.row_label}
                          {ticket.col_number} • {ticket.ticket_status}
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
