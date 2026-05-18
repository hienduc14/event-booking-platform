import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { createPayment, sendPaymentWebhook } from "../../api/payments";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import type { BookingRead } from "../../types/booking";
import type { PaymentRead } from "../../types/payment";
import { formatCurrency, formatDateTime } from "../../utils/format";

function CheckoutPage() {
  const bookingId = Number(useParams().bookingId);
  const location = useLocation();
  const booking = (location.state as { booking?: BookingRead } | null)?.booking;
  const [payment, setPayment] = useState<PaymentRead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);

  async function handleCreatePayment() {
    setLoading(true);
    setError(null);
    try {
      setPayment(await createPayment({ booking_id: bookingId, payment_method: "ONLINE_BANKING" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create payment");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoSuccess() {
    if (!payment) return;
    setLoading(true);
    setError(null);
    try {
      const result = await sendPaymentWebhook({
        transaction_id: `DEMO-${payment.payment_id}`,
        booking_id: payment.booking_id,
        status: "SUCCESS",
        amount: payment.amount,
      });
      setWebhookMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not simulate payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow={`Booking #${bookingId}`}
        title="Checkout"
        description="Create a payment transaction and simulate successful webhook for demo."
      />
      <section className="panel stack-md">
        {booking && (
          <div className="booking-receipt">
            <div>
              <span>Customer</span>
              <strong>{booking.customer_name}</strong>
            </div>
            <div>
              <span>Status</span>
              <Badge>{booking.booking_status}</Badge>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatCurrency(booking.total_amount)}</strong>
            </div>
            <div>
              <span>Expires</span>
              <strong>{formatDateTime(booking.expires_at)}</strong>
            </div>
          </div>
        )}
        {!payment && (
          <Button type="button" disabled={loading} onClick={() => void handleCreatePayment()}>
            {loading ? "Creating payment..." : "Create payment"}
          </Button>
        )}
        {payment && (
          <div className="payment-box">
            <div className="row-between">
              <h2>Payment #{payment.payment_id}</h2>
              <Badge>{payment.status}</Badge>
            </div>
            <p>Method: {payment.payment_method}</p>
            <p>Amount: {formatCurrency(payment.amount)}</p>
            <p className="muted">Backend currently returns transaction only; QR/payment instructions are a backend TODO.</p>
            <div className="inline-actions">
              <Button type="button" disabled={loading} onClick={() => void handleDemoSuccess()}>
                Simulate success webhook
              </Button>
              <Link className="button button-secondary" to={`/booking/${bookingId}/tickets`}>
                View tickets
              </Link>
            </div>
          </div>
        )}
        {webhookMessage && <div className="success-box">{webhookMessage}. Tickets should be generated.</div>}
        {error && <div className="form-error">{error}</div>}
      </section>
    </div>
  );
}

export default CheckoutPage;

