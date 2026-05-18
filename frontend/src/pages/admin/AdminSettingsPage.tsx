import { PageHeader } from "../../components/common/PageHeader";

function AdminSettingsPage() {
  return (
    <div className="stack-lg">
      <PageHeader title="Settings" description="Demo notes and backend integration reminders." />
      <section className="panel stack-md">
        <h2>Frontend assumptions</h2>
        <ul className="check-list">
          <li>Admin token is stored in localStorage for this student/demo project.</li>
          <li>Customer booking does not require login.</li>
          <li>Payment success can be simulated through the public webhook endpoint.</li>
          <li>Event setup creation works, but listing nested setup data needs backend endpoints.</li>
        </ul>
      </section>
    </div>
  );
}

export default AdminSettingsPage;
