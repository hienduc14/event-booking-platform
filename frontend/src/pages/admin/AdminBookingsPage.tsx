import { listBookings } from "../../api/admin";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Badge } from "../../components/common/Badge";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { formatCurrency, formatDateTime } from "../../utils/format";

function AdminBookingsPage() {
  const { token } = useAuth();
  const { data: bookings, loading, error, reload } = useAsync(() => listBookings(token || ""), [token]);

  return (
    <div className="stack-lg">
      <PageHeader title="Bookings" description="Track customer reservations, payment status and refund lifecycle." />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={() => void reload()} />}
      {!loading && !error && bookings?.length === 0 && <EmptyState title="No bookings yet" />}
      {!loading && !error && bookings && bookings.length > 0 && (
        <section className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Total</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>#{booking.booking_id}</td>
                  <td>{booking.customer_name}</td>
                  <td>{booking.email}</td>
                  <td>{booking.phone}</td>
                  <td><Badge>{booking.booking_status}</Badge></td>
                  <td>{formatCurrency(booking.total_amount)}</td>
                  <td>{formatDateTime(booking.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default AdminBookingsPage;

