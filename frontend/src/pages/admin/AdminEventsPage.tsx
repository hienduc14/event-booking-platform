import { Link } from "react-router-dom";
import { cancelAdminEvent, getEvents } from "../../api/events";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";

function AdminEventsPage() {
  const { token } = useAuth();
  const { data: events, loading, error, reload } = useAsync(() => getEvents({ limit: 100 }), []);

  async function handleCancel(eventId: number) {
    const reason = window.prompt("Cancellation reason");
    if (!reason || !token) return;
    await cancelAdminEvent(eventId, reason, token);
    await reload();
  }

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow="Management"
        title="Events"
        description="Current backend exposes public active event list. Admin all-status list is a backend TODO."
        actions={<Link className="button button-primary" to="/admin/events/new">New event</Link>}
      />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={() => void reload()} />}
      {!loading && !error && events?.length === 0 && <EmptyState title="No active events found" />}
      {!loading && !error && events && events.length > 0 && (
        <section className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.event_id}>
                  <td>#{event.event_id}</td>
                  <td>{event.event_name}</td>
                  <td><Badge>{event.status}</Badge></td>
                  <td className="table-actions">
                    <Link to={`/admin/events/${event.event_id}/edit`}>Edit</Link>
                    <Link to={`/admin/events/${event.event_id}/setup`}>Setup</Link>
                    <Button type="button" variant="danger" onClick={() => void handleCancel(event.event_id)}>
                      Cancel
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default AdminEventsPage;

