import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createAdminEvent, getEvent, updateAdminEvent } from "../../api/events";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import type { EventCreate } from "../../types/event";

function AdminEventFormPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const eventId = Number(useParams().eventId);
  const isEdit = Boolean(eventId);
  const [form, setForm] = useState<EventCreate & { status?: string }>({
    event_name: "",
    description: "",
    banner_url: "",
    status: "ACTIVE",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    void getEvent(eventId).then((event) => {
      setForm({
        event_name: event.event_name,
        description: event.description || "",
        banner_url: event.banner_url || "",
        status: event.status,
      });
    });
  }, [eventId, isEdit]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await updateAdminEvent(eventId, form, token);
      } else {
        await createAdminEvent(form, token);
      }
      navigate("/admin/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack-lg">
      <PageHeader title={isEdit ? "Edit event" : "Create event"} description="Manage base event information." />
      <form className="panel form-grid" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        <label>
          Event name
          <input required value={form.event_name} onChange={(event) => setForm((prev) => ({ ...prev, event_name: event.target.value }))} />
        </label>
        <label>
          Banner URL
          <input value={form.banner_url} onChange={(event) => setForm((prev) => ({ ...prev, banner_url: event.target.value }))} />
        </label>
        <label className="full-span">
          Description
          <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
        </label>
        {isEdit && (
          <label>
            Status
            <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </label>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save event"}
        </Button>
      </form>
    </div>
  );
}

export default AdminEventFormPage;

