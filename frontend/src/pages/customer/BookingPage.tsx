import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createReservation } from "../../api/reservations";
import { BookingSummary } from "../../components/booking/BookingSummary";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import type { ReservationRequest } from "../../types/booking";

function BookingPage() {
  const eventId = Number(useParams().eventId);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ReservationRequest>({
    customer_name: "",
    phone: "",
    email: "",
    payment_account: "",
    schedule_id: 0,
    event_day_id: 0,
    items: [{ config_id: 0, quantity: 1 }],
  });

  function setField<K extends keyof ReservationRequest>(field: K, value: ReservationRequest[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setItem(field: "config_id" | "quantity", value: number) {
    setForm((prev) => ({
      ...prev,
      items: [{ ...prev.items[0], [field]: value }],
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow={`Event #${eventId}`}
        title="Reserve tickets"
        description="Enter booking information. Schedule, day and ticket config IDs come from admin setup until nested event detail API is available."
      />
      <div className="two-column">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}
          <label>
            Full name
            <input required value={form.customer_name} onChange={(event) => setField("customer_name", event.target.value)} />
          </label>
          <label>
            Phone
            <input required value={form.phone} onChange={(event) => setField("phone", event.target.value)} />
          </label>
          <label>
            Email
            <input required type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} />
          </label>
          <label>
            Refund payment account
            <input required value={form.payment_account} onChange={(event) => setField("payment_account", event.target.value)} />
          </label>
          <label>
            Schedule ID
            <input required min={1} type="number" value={form.schedule_id || ""} onChange={(event) => setField("schedule_id", Number(event.target.value))} />
          </label>
          <label>
            Event day ID
            <input required min={1} type="number" value={form.event_day_id || ""} onChange={(event) => setField("event_day_id", Number(event.target.value))} />
          </label>
          <label>
            Ticket config ID
            <input required min={1} type="number" value={form.items[0].config_id || ""} onChange={(event) => setItem("config_id", Number(event.target.value))} />
          </label>
          <label>
            Quantity
            <input required min={1} type="number" value={form.items[0].quantity} onChange={(event) => setItem("quantity", Number(event.target.value))} />
          </label>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating reservation..." : "Create reservation"}
          </Button>
        </form>
        <BookingSummary scheduleId={form.schedule_id} eventDayId={form.event_day_id} items={form.items} />
      </div>
    </div>
  );
}

export default BookingPage;

