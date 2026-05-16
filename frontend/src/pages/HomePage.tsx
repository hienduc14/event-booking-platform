import EventList from "../components/EventList";

function HomePage() {
  return (
    <main>
      <header>
        <h1>Event Booking Platform</h1>
        <p>Search events, choose a date, and book tickets easily.</p>
      </header>
      <EventList />
    </main>
  );
}

export default HomePage;
