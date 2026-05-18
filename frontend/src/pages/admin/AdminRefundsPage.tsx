import { useState } from "react";
import { listPendingRefunds, processAllRefunds } from "../../api/admin";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { formatCurrency, formatDateTime } from "../../utils/format";

function AdminRefundsPage() {
  const { token } = useAuth();
  const { data: refunds, loading, error, reload } = useAsync(() => listPendingRefunds(token || ""), [token]);
  const [message, setMessage] = useState<string | null>(null);

  async function handleProcessAll() {
    if (!token) return;
    const result = await processAllRefunds(token);
    setMessage(result.message);
    await reload();
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title="Refunds"
        description="Pending refund transactions created when events are cancelled."
        actions={<Button type="button" onClick={() => void handleProcessAll()}>Process all</Button>}
      />
      {message && <div className="success-box">{message}</div>}
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={() => void reload()} />}
      {!loading && !error && refunds?.length === 0 && <EmptyState title="No pending refunds" />}
      {!loading && !error && refunds && refunds.length > 0 && (
        <section className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Booking</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((refund) => (
                <tr key={refund.refund_id}>
                  <td>#{refund.refund_id}</td>
                  <td>#{refund.booking_id}</td>
                  <td><Badge>{refund.status}</Badge></td>
                  <td>{formatCurrency(refund.amount)}</td>
                  <td>{refund.reason || "N/A"}</td>
                  <td>{formatDateTime(refund.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default AdminRefundsPage;

