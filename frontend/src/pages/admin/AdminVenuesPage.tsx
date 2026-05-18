import { useState } from "react";
import { createVenue, listVenues } from "../../api/admin";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import type { VenueCreate } from "../../types/venue";

function AdminVenuesPage() {
  const { token } = useAuth();
  const { data: venues, loading, error, reload } = useAsync(() => listVenues(token || ""), [token]);
  const [form, setForm] = useState<VenueCreate>({ venue_name: "", city: "", address: "", capacity: 1 });
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSubmitError(null);
    try {
      await createVenue(form, token);
      setForm({ venue_name: "", city: "", address: "", capacity: 1 });
      await reload();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not create venue");
    }
  }

  return (
    <div className="stack-lg">
      <PageHeader title="Venues" description="Create and review event locations. Capacity is used by ticket config validation." />
      <div className="two-column">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <h2>Create venue</h2>
          {submitError && <div className="form-error">{submitError}</div>}
          <label>
            Name
            <input required value={form.venue_name} onChange={(event) => setForm((prev) => ({ ...prev, venue_name: event.target.value }))} />
          </label>
          <label>
            City
            <input required value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} />
          </label>
          <label>
            Address
            <input value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
          </label>
          <label>
            Capacity
            <input type="number" min={1} value={form.capacity} onChange={(event) => setForm((prev) => ({ ...prev, capacity: Number(event.target.value) }))} />
          </label>
          <Button type="submit">Create venue</Button>
        </form>
        <section className="panel table-wrap">
          {loading && <LoadingState />}
          {error && <ErrorState message={error} onRetry={() => void reload()} />}
          {!loading && !error && venues?.length === 0 && <EmptyState title="No venues yet" />}
          {!loading && !error && venues && venues.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Capacity</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((venue) => (
                  <tr key={venue.venue_id}>
                    <td>#{venue.venue_id}</td>
                    <td>{venue.venue_name}</td>
                    <td>{venue.city}</td>
                    <td>{venue.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminVenuesPage;

