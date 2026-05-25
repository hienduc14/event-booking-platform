import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { createPayment, sendPaymentWebhook } from "../../api/payments";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/common/Icon";
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

  const step = webhookMessage ? 3 : payment ? 2 : 1;

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow={`Booking #${bookingId}`}
        eyebrowIcon="credit-card"
        title="Checkout"
        description="Create a payment transaction and complete it to receive your electronic tickets."
      />

      <div className="checkout-steps">
        <div className={`checkout-step ${step > 1 ? "done" : "active"}`}>
          <span className="checkout-step-index">{step > 1 ? <Icon name="check" size={14} /> : "1"}</span>
          Reservation
        </div>
        <div className={`checkout-step ${step === 2 ? "active" : step > 2 ? "done" : ""}`}>
          <span className="checkout-step-index">{step > 2 ? <Icon name="check" size={14} /> : "2"}</span>
          Payment
        </div>
        <div className={`checkout-step ${step === 3 ? "done" : ""}`}>
          <span className="checkout-step-index">{step === 3 ? <Icon name="check" size={14} /> : "3"}</span>
          Tickets
        </div>
      </div>

      <section className="panel stack-md">
        {booking ? (
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
              <strong style={{ background: "var(--gradient-cta)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                {formatCurrency(booking.total_amount)}
              </strong>
            </div>
            <div>
              <span>Expires</span>
              <strong>{formatDateTime(booking.expires_at)}</strong>
            </div>
          </div>
        ) : (
          <div className="state-box">
            <div>
              <strong>Booking #{bookingId}</strong>
              <p>Booking details were not passed to this page. Continue to create a payment.</p>
            </div>
          </div>
        )}

        {!payment && (
          <Button type="button" size="lg" disabled={loading} onClick={() => void handleCreatePayment()}>
            <Icon name="credit-card" size={16} />
            {loading ? "Creating payment..." : "Create payment"}
          </Button>
        )}

        {payment && (
          <div className="payment-box">
            <div className="row-between">
              <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Icon name="credit-card" /> Payment #{payment.payment_id}
              </h2>
              <Badge>{payment.status}</Badge>
            </div>
            <p className="text-muted">
              <strong>Method:</strong> {payment.payment_method}
            </p>
            <p className="text-muted">
              <strong>Amount:</strong>{" "}
              <span style={{ color: "var(--primary-strong)", fontWeight: 700 }}>
                {formatCurrency(payment.amount)}
              </span>
            </p>
            <p className="text-soft" style={{ fontSize: "0.85rem" }}>
              Backend currently returns transaction only; QR/payment instructions are a backend TODO.
            </p>
            <div className="inline-actions">
              <Button type="button" disabled={loading} onClick={() => void handleDemoSuccess()}>
                <Icon name="check" size={16} />
                Simulate success webhook
              </Button>
              <Link className="button button-outline" to={`/booking/${bookingId}/tickets`}>
                View tickets
                <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          </div>
        )}

        {webhookMessage && (
          <div className="success-box">
            <div>
              <strong>{webhookMessage}</strong>
              <p>Your electronic tickets have been generated and are ready to use.</p>
            </div>
            <Link className="button button-primary" to={`/booking/${bookingId}/tickets`}>
              View my tickets
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        )}
        {error && <div className="form-error">{error}</div>}
      </section>
    </div>
  );
}

export default CheckoutPage;
