import { Link } from "react-router-dom";
import { getEvents } from "../../api/events";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/AsyncState";
import { Icon } from "../../components/common/Icon";
import { EventCard } from "../../components/events/EventCard";
import { useAsync } from "../../hooks/useAsync";

function HomePage() {
  const { data: events, loading, error, reload } = useAsync(() => getEvents({ limit: 6 }), []);

  return (
    <div className="stack-xl">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">
            <Icon name="sparkles" size={14} />
            Eventify · Live experiences
          </span>
          <h1>The fastest way to book tickets for the concerts you love.</h1>
          <p>
            Discover upcoming shows, reserve seats in seconds, pay securely, and receive your
            e-tickets with QR codes — all in one smooth flow.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary button-lg" to="/events">
              Browse events
              <Icon name="arrow-right" size={16} />
            </Link>
            <a className="button button-on-dark button-lg" href="#how-it-works">
              How it works
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>50K+</strong>
              <span>Tickets booked</span>
            </div>
            <div className="hero-stat">
              <strong>120+</strong>
              <span>Live events</span>
            </div>
            <div className="hero-stat">
              <strong>4.9★</strong>
              <span>Average rating</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <Icon name="music" size={14} />
              Upcoming
            </p>
            <h2>Featured events</h2>
          </div>
          <button type="button" className="button button-ghost button-sm" onClick={() => void reload()}>
            Refresh
          </button>
        </div>
        {loading && <LoadingState variant="card" skeletonCount={6} />}
        {error && <ErrorState message={error} onRetry={() => void reload()} />}
        {!loading && !error && events?.length === 0 && (
          <EmptyState
            title="No active events yet"
            description="Check back soon — new shows are added weekly."
            icon="calendar"
          />
        )}
        {!loading && !error && events && events.length > 0 && (
          <div className="event-grid">
            {events.map((event) => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section id="how-it-works">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <Icon name="info" size={14} />
              How it works
            </p>
            <h2>Three simple steps to your seat</h2>
          </div>
        </div>
        <div className="step-grid">
          <article className="step-card">
            <span className="step-card-icon">
              <Icon name="search" />
            </span>
            <span className="step-card-num">STEP 01</span>
            <h3>Discover events</h3>
            <p className="text-muted">
              Browse the catalogue, filter by name, and check schedules, ticket types, and seat
              availability.
            </p>
          </article>
          <article className="step-card">
            <span className="step-card-icon">
              <Icon name="ticket" />
            </span>
            <span className="step-card-num">STEP 02</span>
            <h3>Reserve your seats</h3>
            <p className="text-muted">
              Pick a show day, choose seats one by one, and lock them with a short reservation.
            </p>
          </article>
          <article className="step-card">
            <span className="step-card-icon">
              <Icon name="qr" />
            </span>
            <span className="step-card-num">STEP 03</span>
            <h3>Pay &amp; get e-tickets</h3>
            <p className="text-muted">
              Complete the payment, then receive QR-coded electronic tickets you can use at the
              gate.
            </p>
          </article>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <Icon name="shield" size={14} />
              Why Eventify
            </p>
            <h2>Built for fans, designed for organizers</h2>
          </div>
        </div>
        <div className="feature-grid">
          <article className="step-card">
            <span className="step-card-icon"><Icon name="shield" /></span>
            <h3>Secure payments</h3>
            <p className="text-muted">Payments are processed safely with clear receipts and audit trails.</p>
          </article>
          <article className="step-card">
            <span className="step-card-icon"><Icon name="qr" /></span>
            <h3>Instant QR tickets</h3>
            <p className="text-muted">No printing required. Show your QR at the venue and walk in.</p>
          </article>
          <article className="step-card">
            <span className="step-card-icon"><Icon name="users" /></span>
            <h3>Friendly support</h3>
            <p className="text-muted">Our team is ready to help with refunds, exchanges, and questions.</p>
          </article>
          <article className="step-card">
            <span className="step-card-icon"><Icon name="headphones" /></span>
            <h3>Live experiences</h3>
            <p className="text-muted">Curated concerts and shows across Hà Nội, TP. HCM, and Đà Nẵng.</p>
          </article>
        </div>
      </section>

      <section className="cta-strip">
        <div>
          <h2>Ready for your next concert?</h2>
          <p>Find the perfect show, grab the best seats, and make the night unforgettable.</p>
        </div>
        <Link to="/events" className="button button-on-dark button-lg">
          Explore events
          <Icon name="arrow-right" size={16} />
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
