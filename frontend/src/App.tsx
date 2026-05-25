import { Route, Routes, Navigate } from "react-router-dom";
import { CustomerLayout } from "./components/layout/CustomerLayout";
import HomePage from "./pages/customer/HomePage";
import EventListPage from "./pages/customer/EventListPage";
import EventDetailPage from "./pages/customer/EventDetailPage";
import BookingPage from "./pages/customer/BookingPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import BookingTicketsPage from "./pages/customer/BookingTicketsPage";
import TicketDetailPage from "./pages/customer/TicketDetailPage";

function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventListPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/events/:eventId/book" element={<BookingPage />} />
        <Route path="/checkout/:bookingId" element={<CheckoutPage />} />
        <Route path="/booking/:bookingId/tickets" element={<BookingTicketsPage />} />
        <Route path="/tickets/:ticketCode" element={<TicketDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
