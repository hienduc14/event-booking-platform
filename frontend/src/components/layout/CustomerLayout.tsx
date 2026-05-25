import { NavLink, Outlet } from "react-router-dom";

export function CustomerLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand">
          Event Booking
        </NavLink>
        <nav className="site-nav">
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/tickets/lookup">Ticket lookup</NavLink>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="site-footer">FastAPI + React event ticket booking demo</footer>
    </div>
  );
}

