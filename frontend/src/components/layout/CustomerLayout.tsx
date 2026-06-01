import { Link, NavLink, Outlet } from "react-router-dom";
import { Icon } from "../common/Icon";

export function CustomerLayout() {
  const year = new Date().getFullYear();
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <NavLink to="/" className="brand" aria-label="Eventify home">
            <span className="brand-mark">
              <Icon name="ticket" size={18} />
            </span>
            <span className="brand-name">Eventify</span>
          </NavLink>
          <nav className="site-nav" aria-label="Primary">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/events">Events</NavLink>
            {/* <NavLink to="/tickets/lookup">Ticket lookup</NavLink> */}
          </nav>
          <div className="site-header-actions">
            <Link to="/events" className="button button-primary button-sm">
              Browse events
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <span className="brand">
              <span className="brand-mark">
                <Icon name="ticket" size={18} />
              </span>
              <span className="brand-name">Eventify</span>
            </span>
            <p>
              Modern event ticketing — discover concerts, reserve seats, pay securely, and receive
              instant e-tickets with QR codes.
            </p>
          </div>
          <div className="site-footer-col">
            <h4>Discover</h4>
            <ul>
              <li><Link to="/events">All events</Link></li>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/tickets/lookup">Find my ticket</Link></li>
            </ul>
          </div>
          <div className="site-footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="mailto:support@eventify.demo">support@eventify.demo</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#terms">Terms &amp; Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="site-footer-bottom">
          <span>© {year} Eventify · FastAPI + React demo</span>
          <span>Made for live experiences ✦ Hà Nội · TP. HCM · Đà Nẵng</span>
        </div>
      </footer>
    </div>
  );
}
