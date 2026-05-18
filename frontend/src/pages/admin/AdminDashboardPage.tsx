import { Link } from "react-router-dom";
import { listBookings, listPendingRefunds } from "../../api/admin";
import { getEvents } from "../../api/events";
import { ErrorState, LoadingState } from "../../components/common/AsyncState";
import { PageHeader } from "../../components/common/PageHeader";
import { MetricCard } from "../../components/admin/MetricCard";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { formatCurrency, formatDateTime } from "../../utils/format";
import { Badge } from "../../components/common/Badge";

function AdminDashboardPage() {
  const { token } = useAuth();
  const events = useAsync(() => getEvents({ limit: 100 }), []);
  const bookings = useAsync(() => listBookings(token || ""), [token]);
  const refunds = useAsync(() => listPendingRefunds(token || ""), [token]);

  const loading = events.loading || bookings.loading || refunds.loading;
  const error = events.error || bookings.error || refunds.error;

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow="Overview"
        title="Admin dashboard"
        description="Operational snapshot for events, bookings and pending refunds."
        actions={<Link className="button button-primary" to="/admin/events/new">Create event</Link>}
      />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <>
          <div className="metric-grid">
            <MetricCard label="Active events" value={events.data?.length || 0} hint="Public active event list" />
            <MetricCard label="Bookings" value={bookings.data?.length || 0} hint="Latest admin booking rows" />
            <MetricCard label="Pending refunds" value={refunds.data?.length || 0} hint="Needs processing" />
          </div>
          <section className="panel">
            <div className="row-between">
              <h2>Recent bookings</h2>
              <Link to="/admin/bookings">View all</Link>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(bookings.data || []).slice(0, 6).map((booking) => (
                    <tr key={booking.booking_id}>
                      <td>#{booking.booking_id}</td>
                      <td>{booking.customer_name}</td>
                      <td><Badge>{booking.booking_status}</Badge></td>
                      <td>{formatCurrency(booking.total_amount)}</td>
                      <td>{formatDateTime(booking.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default AdminDashboardPage;

