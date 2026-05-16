import { useState } from "react";
import type { TicketBookingInput } from "../types/ticket";

interface Props {
  eventId: number;
}

function TicketBookingForm({ eventId }: Props) {
  const [form, setForm] = useState<TicketBookingInput>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    ticketType: "gold",
    quantity: 1,
  });

  const handleChange = (field: keyof TicketBookingInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Submit booking for event", eventId, form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Book tickets</h2>
      <label>
        Name
        <input value={form.customerName} onChange={(e) => handleChange("customerName", e.target.value)} />
      </label>
      <label>
        Email
        <input type="email" value={form.customerEmail} onChange={(e) => handleChange("customerEmail", e.target.value)} />
      </label>
      <label>
        Phone
        <input value={form.customerPhone} onChange={(e) => handleChange("customerPhone", e.target.value)} />
      </label>
      <label>
        Ticket type
        <select value={form.ticketType} onChange={(e) => handleChange("ticketType", e.target.value)}>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="bronze">Bronze</option>
          <option value="plastic">Plastic</option>
        </select>
      </label>
      <label>
        Quantity
        <input
          type="number"
          min={1}
          value={form.quantity}
          onChange={(e) => handleChange("quantity", Number(e.target.value))}
        />
      </label>
      <button type="submit">Reserve ticket</button>
    </form>
  );
}

export default TicketBookingForm;
