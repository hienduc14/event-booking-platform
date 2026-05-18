import { formatCurrency } from "../../utils/format";

export function BookingSummary({
  scheduleId,
  eventDayId,
  items,
}: {
  scheduleId: number;
  eventDayId: number;
  items: Array<{ config_id: number; quantity: number; price?: number }>;
}) {
  const estimatedTotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <aside className="summary-panel">
      <h2>Booking summary</h2>
      <dl>
        <div>
          <dt>Schedule ID</dt>
          <dd>{scheduleId || "Not set"}</dd>
        </div>
        <div>
          <dt>Event day ID</dt>
          <dd>{eventDayId || "Not set"}</dd>
        </div>
      </dl>
      <div className="summary-list">
        {items.map((item, index) => (
          <div key={`${item.config_id}-${index}`} className="summary-row">
            <span>Config #{item.config_id || "?"}</span>
            <strong>x{item.quantity}</strong>
          </div>
        ))}
      </div>
      {estimatedTotal > 0 && (
        <div className="summary-total">
          <span>Estimated total</span>
          <strong>{formatCurrency(estimatedTotal)}</strong>
        </div>
      )}
    </aside>
  );
}

