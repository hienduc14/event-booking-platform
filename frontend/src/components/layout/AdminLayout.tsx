import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../common/Button";

const adminLinks = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/events", label: "Events" },
  { to: "/admin/venues", label: "Venues" },
  { to: "/admin/artists", label: "Artists" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/refunds", label: "Refunds" },
  { to: "/admin/settings", label: "Settings" },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink to="/admin" className="admin-brand">
          Event Admin
        </NavLink>
        <nav className="admin-nav">
          {adminLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/admin"}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>Admin workspace</span>
          <Button type="button" variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

