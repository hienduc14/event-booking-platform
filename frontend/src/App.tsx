import { Route, Routes, Navigate } from "react-router-dom";
import { CustomerLayout } from "./components/layout/CustomerLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import HomePage from "./pages/customer/HomePage";
import EventListPage from "./pages/customer/EventListPage";
import EventDetailPage from "./pages/customer/EventDetailPage";
import BookingPage from "./pages/customer/BookingPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import BookingTicketsPage from "./pages/customer/BookingTicketsPage";
import TicketDetailPage from "./pages/customer/TicketDetailPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminEventFormPage from "./pages/admin/AdminEventFormPage";
import AdminEventSetupPage from "./pages/admin/AdminEventSetupPage";
import AdminVenuesPage from "./pages/admin/AdminVenuesPage";
import AdminArtistsPage from "./pages/admin/AdminArtistsPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminRefundsPage from "./pages/admin/AdminRefundsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

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
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/events/new" element={<AdminEventFormPage />} />
          <Route path="/admin/events/:eventId/edit" element={<AdminEventFormPage />} />
          <Route path="/admin/events/:eventId/setup" element={<AdminEventSetupPage />} />
          <Route path="/admin/venues" element={<AdminVenuesPage />} />
          <Route path="/admin/artists" element={<AdminArtistsPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/refunds" element={<AdminRefundsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
