import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { createPayment, processPayment } from "../../api/payments";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/common/Icon";
import { PageHeader } from "../../components/common/PageHeader";
import type { BookingRead } from "../../types/booking";
import type { PaymentMethod, PaymentProcessResult, PaymentRead } from "../../types/payment";
import { formatCurrency, formatDateTime } from "../../utils/format";

function CheckoutPage() {
  const bookingId = Number(useParams().bookingId);
  const location = useLocation();
  const booking = (location.state as { booking?: BookingRead } | null)?.booking;
  const [payment, setPayment] = useState<PaymentRead | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ONLINE_BANKING");
  const [refundAccount, setRefundAccount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvv, setCvv] = useState("");
  const [result, setResult] = useState<PaymentProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPayment() {
      setLoading(true);
      setError(null);
      try {
        const data = await createPayment({ booking_id: bookingId, payment_method: "ONLINE_BANKING" });
        if (!cancelled) setPayment(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not initialize payment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPayment();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  async function handleContinue() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await processPayment({
        booking_id: bookingId,
        payment_method: paymentMethod,
        refund_account: paymentMethod === "ONLINE_BANKING" ? refundAccount : undefined,
        card_number: paymentMethod === "CARD_PAYMENT" ? cardNumber : undefined,
        expiration: paymentMethod === "CARD_PAYMENT" ? expiration : undefined,
        cvv: paymentMethod === "CARD_PAYMENT" ? cvv : undefined,
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment processing failed");
    } finally {
      setLoading(false);
    }
  }

  const step = result?.tickets_ready ? 3 : payment ? 2 : 1;

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow={`Booking #${bookingId}`}
        title="Payment"
        description="Choose online banking or card payment, then continue the checkout flow described in the system design."
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
              <Badge>{result?.booking_status || booking.booking_status}</Badge>
            </div>
            <div>
              <span>Total</span>
              <strong style={{ background: "var(--gradient-cta)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                {formatCurrency(booking.total_amount)}
              </strong>
            </div>
            <div>
              <span>Created</span>
              <strong>{formatDateTime(booking.created_at)}</strong>
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

        {payment && (
          <>
            <div className="panel stack-md">
              <div className="row-between">
                <h2>Payment method</h2>
                <Badge>{result?.status || payment.status}</Badge>
              </div>
              <p>Amount: {formatCurrency(payment.amount)}</p>
              <div className="payment-method-switch">
                <button
                  type="button"
                  className={`button ${paymentMethod === "ONLINE_BANKING" ? "button-primary" : "button-secondary"}`}
                  onClick={() => setPaymentMethod("ONLINE_BANKING")}
                >
                  Online banking
                </button>
                <button
                  type="button"
                  className={`button ${paymentMethod === "CARD_PAYMENT" ? "button-primary" : "button-secondary"}`}
                  onClick={() => setPaymentMethod("CARD_PAYMENT")}
                >
                  Card payment
                </button>
              </div>
            </div>

            {paymentMethod === "ONLINE_BANKING" ? (
              <div className="payment-layout">
                <div className="payment-bank-card">
                  <h3>Company bank account</h3>
                  <p><strong>Bank:</strong> {payment.company_bank.bank_name}</p>
                  <p><strong>Account name:</strong> {payment.company_bank.account_name}</p>
                  <p><strong>Account number:</strong> {payment.company_bank.account_number}</p>
                  <img className="payment-qr-image" src={payment.company_bank.qr_code_url} alt="Company payment QR" />
                </div>
                <div className="payment-form-card">
                  <h3>Online banking confirmation</h3>
                  <p className="muted">
                    Transfer to the company account above, then provide the refund account that should be used if this event is cancelled.
                  </p>
                  <label>
                    Refund account
                    <input value={refundAccount} onChange={(event) => setRefundAccount(event.target.value)} placeholder="Your refund bank account" />
                  </label>
                  <Button type="button" disabled={loading} onClick={() => void handleContinue()}
                    style={{ marginTop: "1rem" }}  
                  >
                    {loading ? "Submitting..." : "Continue"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="payment-layout">
                <div className="payment-bank-card">
                  <h3>Payment summary</h3>
                  <p>Method: Credit/Debit card</p>
                  <p>Total due: {formatCurrency(payment.amount)}</p>
                  <p className="muted">The system will process the card immediately and return the payment result.</p>
                </div>
                <div className="payment-form-card">
                  <h3>Card information</h3>
                  <label
                    style={{ marginTop: "1rem" }} 
                  >
                    Card number
                    <input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} placeholder="1234 5678 9012 3456" />
                  </label>
                  <div className="payment-inline-fields"
                    style={{ marginTop: "0.5rem" }} 
                  >
                    <label>
                      Expiration
                      <input value={expiration} onChange={(event) => setExpiration(event.target.value)} placeholder="MM/YY" />
                    </label>
                    <label>
                      CVV
                      <input value={cvv} onChange={(event) => setCvv(event.target.value)} placeholder="123" />
                    </label>
                  </div>
                  <Button type="button" disabled={loading} onClick={() => void handleContinue()}
                    style={{ marginTop: "1rem" }}   
                  >
                    {loading ? "Processing..." : "Continue"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {result && <div className={result.status === "SUCCESS" ? "success-box" : "state-box"}>{result.message}</div>}
        {result?.tickets_ready && (
          <div className="inline-actions">
            <Link className="button button-secondary" to={`/booking/${bookingId}/tickets`}>
              View tickets
            </Link>
          </div>
        )}

        {error && <div className="form-error">{error}</div>}
      </section>
    </div>
  );
}

export default CheckoutPage;
