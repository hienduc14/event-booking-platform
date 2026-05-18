import { useState } from "react";
import { createArtist, listArtists } from "../../api/admin";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import type { ArtistCreate } from "../../types/artist";

function AdminArtistsPage() {
  const { token } = useAuth();
  const { data: artists, loading, error, reload } = useAsync(() => listArtists(token || ""), [token]);
  const [form, setForm] = useState<ArtistCreate>({ artist_name: "", bio: "", image_url: "" });
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSubmitError(null);
    try {
      await createArtist(form, token);
      setForm({ artist_name: "", bio: "", image_url: "" });
      await reload();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not create artist");
    }
  }

  return (
    <div className="stack-lg">
      <PageHeader title="Artists" description="Manage performer and backup artist catalog." />
      <div className="two-column">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <h2>Create artist</h2>
          {submitError && <div className="form-error">{submitError}</div>}
          <label>
            Name
            <input required value={form.artist_name} onChange={(event) => setForm((prev) => ({ ...prev, artist_name: event.target.value }))} />
          </label>
          <label>
            Image URL
            <input value={form.image_url} onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))} />
          </label>
          <label className="full-span">
            Bio
            <textarea value={form.bio} onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))} />
          </label>
          <Button type="submit">Create artist</Button>
        </form>
        <section className="panel table-wrap">
          {loading && <LoadingState />}
          {error && <ErrorState message={error} onRetry={() => void reload()} />}
          {!loading && !error && artists?.length === 0 && <EmptyState title="No artists yet" />}
          {!loading && !error && artists && artists.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Bio</th>
                </tr>
              </thead>
              <tbody>
                {artists.map((artist) => (
                  <tr key={artist.artist_id}>
                    <td>#{artist.artist_id}</td>
                    <td>{artist.artist_name}</td>
                    <td>{artist.bio || "N/A"}</td>
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

export default AdminArtistsPage;

