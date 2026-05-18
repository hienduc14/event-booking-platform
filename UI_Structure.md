# UI Structure Plan - Event Booking Platform

Tài liệu này mô tả kế hoạch thiết kế frontend cho hệ thống đặt vé sự kiện. Mục tiêu là thống nhất sitemap, page hierarchy, component structure, state management, API integration và roadmap trước khi bắt đầu code UI.

## 1. Tổng Quan Hệ Thống Hiện Tại

Project đang đi theo mô hình client-server:

- Frontend: React 18, Vite, TypeScript, React Router.
- Backend: FastAPI, SQLAlchemy, Pydantic, PostgreSQL.
- Business domain: xem sự kiện, giữ vé, thanh toán, phát hành vé điện tử, quản trị sự kiện, hoàn tiền khi hủy sự kiện.

Frontend hiện tại mới ở mức scaffold:

- `src/App.tsx`: route cơ bản `/`, `/events/:eventId`, `/admin`.
- `src/pages`: `HomePage`, `EventPage`, `AdminPage`.
- `src/components`: `EventList`, `TicketBookingForm`.
- `src/api/apiClient.ts`: có `fetchEvents`, `createTicket` nhưng chưa khớp API backend hiện tại.
- `src/types`: type demo cũ, chưa khớp schema backend.

Backend hiện tại đã có các domain chính nhưng chưa đủ API đọc chi tiết cho toàn bộ UI:

- Public APIs: events, reservations, payments, tickets.
- Admin APIs: auth, events, venues, artists, bookings, refunds.
- Database models: events, venues, event_schedules, event_days, artists, event_artists, ticket_configs, bookings, booking_details, e_tickets, payment_transactions, refund_transactions.

## 2. Định Hướng UI/UX

Giao diện nên ưu tiên rõ ràng, dễ demo và dễ thao tác hơn là hiệu ứng phức tạp.

Định hướng visual:

- Clean, hiện đại, nhiều khoảng trắng vừa đủ.
- Bố cục dashboard admin gọn, có sidebar, topbar, bảng dữ liệu và form rõ ràng.
- Customer site tập trung vào hành trình: tìm sự kiện -> xem chi tiết -> chọn ngày/loại vé -> giữ vé -> thanh toán -> xem vé.
- Không dùng animation phức tạp; chỉ cần hover, focus, transition nhẹ.
- Màu sắc nên trung tính: nền sáng, text đậm, accent xanh dương hoặc xanh teal cho CTA.
- Trạng thái booking/payment/ticket/refund phải hiển thị bằng badge màu dễ hiểu.

Nguyên tắc UX:

- Customer luôn thấy bước hiện tại trong booking flow.
- Admin luôn thấy trạng thái dữ liệu và hành động chính.
- Form cần validation rõ ràng trước khi gửi API.
- Khi API thiếu dữ liệu, UI cần degrade hợp lý và ghi TODO backend.

## 3. Actor

### 3.1 Customer

Customer không cần đăng nhập. Customer có thể:

- Xem danh sách sự kiện active.
- Xem chi tiết sự kiện.
- Chọn lịch diễn, ngày diễn, loại vé, số lượng.
- Nhập thông tin đặt vé.
- Tạo reservation.
- Tạo payment.
- Xem kết quả thanh toán.
- Xem vé điện tử theo booking hoặc ticket code.

### 3.2 Admin

Admin đăng nhập bằng JWT. Admin có thể:

- Đăng nhập dashboard.
- Tạo/sửa/hủy sự kiện.
- Tạo/sửa địa điểm.
- Tạo schedule, event day, ticket config.
- Tạo nghệ sĩ và gán nghệ sĩ vào event day.
- Xem danh sách booking.
- Xem refund pending và trigger xử lý refund.

### 3.3 Payment Gateway / Webhook

Không phải actor UI trực tiếp. Frontend chỉ cần mô phỏng hoặc hiển thị trạng thái payment theo API backend. Webhook thường do hệ thống bên ngoài gọi.

## 4. Business Flow Chính

### 4.1 Customer Browse Flow

1. Customer vào trang chủ hoặc trang events.
2. Frontend gọi `GET /api/v1/events`.
3. Customer chọn event.
4. Frontend gọi `GET /api/v1/events/{event_id}`.
5. UI hiển thị event detail và lựa chọn đặt vé.

Backend gap: `GET /api/v1/events/{event_id}` hiện trả `EventRead` cơ bản, chưa trả nested schedules, event_days, ticket_configs, venues, artists, remaining_quantity. Frontend booking đầy đủ sẽ cần API detail mở rộng.

### 4.2 Reservation Flow

1. Customer chọn schedule, event day, ticket config và quantity.
2. Customer nhập name, phone, email, payment_account.
3. Frontend gửi `POST /api/v1/reservations`.
4. Backend tạo booking `PENDING_PAYMENT`, trả `BookingRead`.
5. Frontend lưu booking hiện tại để chuyển sang payment page.

### 4.3 Payment Flow

1. Customer ở trang payment.
2. Frontend gọi `POST /api/v1/payments/create`.
3. Backend tạo payment transaction `INITIATED`.
4. UI hiển thị payment instruction, amount và trạng thái.
5. Với demo, có thể dùng Swagger/Postman gọi webhook hoặc cần thêm mock payment UI nếu backend hỗ trợ.

Backend gap: hiện API create payment chỉ trả transaction, chưa trả QR/payment URL/instruction/expired_at.

### 4.4 Ticket Flow

1. Khi payment webhook thành công, backend generate e-ticket.
2. Customer mở `/booking/:bookingId/tickets`.
3. Frontend gọi `GET /api/v1/tickets/booking/{booking_id}`.
4. Customer xem QR, ticket code và trạng thái vé.

Backend gap: chưa có public endpoint lấy booking detail theo booking_id; chỉ có tickets by booking.

### 4.5 Admin Management Flow

1. Admin login bằng `POST /api/v1/admin/login`.
2. Frontend lưu access token.
3. Các API admin gửi header `Authorization: Bearer <token>`.
4. Admin tạo dữ liệu nền: venue -> event -> schedule -> day -> ticket config -> artist -> assign artist.
5. Admin theo dõi bookings/refunds.
6. Admin hủy event khi cần, backend tạo refund requests.

Backend gap: admin events hiện chưa có endpoint list/get event trong admin router. Có thể dùng public `GET /api/v1/events` để list active, nhưng admin cần xem cả cancelled/inactive.

## 5. Sitemap

```txt
/
/events
/events/:eventId
/events/:eventId/book
/checkout/:bookingId
/booking/:bookingId/tickets
/tickets/:ticketCode

/admin/login
/admin
/admin/events
/admin/events/new
/admin/events/:eventId/edit
/admin/events/:eventId/setup
/admin/venues
/admin/artists
/admin/bookings
/admin/refunds
/admin/settings
```

## 6. Page List

### 6.1 Customer Pages

| Page | Route | Purpose | Main APIs |
|---|---|---|---|
| HomePage | `/` | Landing + featured events | `GET /api/v1/events` |
| EventListPage | `/events` | Browse/search/filter events | `GET /api/v1/events` |
| EventDetailPage | `/events/:eventId` | Detail, schedule/day/ticket options | `GET /api/v1/events/{event_id}` |
| BookingPage | `/events/:eventId/book` | Form chọn vé và nhập thông tin | `POST /api/v1/reservations` |
| CheckoutPage | `/checkout/:bookingId` | Tạo payment và hướng dẫn thanh toán | `POST /api/v1/payments/create` |
| BookingTicketsPage | `/booking/:bookingId/tickets` | Xem vé theo booking | `GET /api/v1/tickets/booking/{booking_id}` |
| TicketDetailPage | `/tickets/:ticketCode` | Xem/scan một vé | `GET /api/v1/tickets/{ticket_code}` |

### 6.2 Admin Pages

| Page | Route | Purpose | Main APIs |
|---|---|---|---|
| AdminLoginPage | `/admin/login` | Login admin | `POST /api/v1/admin/login` |
| AdminDashboardPage | `/admin` | Overview metrics, quick actions | bookings/refunds/events APIs |
| AdminEventListPage | `/admin/events` | List/search/manage events | missing admin list; fallback public list |
| AdminEventFormPage | `/admin/events/new`, `/admin/events/:eventId/edit` | Create/update event | `POST /api/v1/admin/events`, `PUT /api/v1/admin/events/{id}` |
| AdminEventSetupPage | `/admin/events/:eventId/setup` | Schedule/day/ticket config/artist setup | `POST /api/v1/admin/events/schedules`, `/days`, `/ticket-configs`, `/api/v1/admin/artists/assign` |
| AdminVenuePage | `/admin/venues` | CRUD venues | `GET/POST/PUT /api/v1/admin/venues` |
| AdminArtistPage | `/admin/artists` | Create/list artists | `GET/POST /api/v1/admin/artists` |
| AdminBookingPage | `/admin/bookings` | Booking list and status | `GET /api/v1/admin/bookings` |
| AdminRefundPage | `/admin/refunds` | Pending refunds and process action | `GET /api/v1/admin/refunds/pending`, `POST /api/v1/admin/refunds/process-all` |
| AdminSettingsPage | `/admin/settings` | Demo config/help page | no backend required initially |

## 7. Routing Plan

Use React Router v6.

Proposed route grouping:

```txt
CustomerLayout
  /
  /events
  /events/:eventId
  /events/:eventId/book
  /checkout/:bookingId
  /booking/:bookingId/tickets
  /tickets/:ticketCode

AdminAuthLayout
  /admin/login

AdminLayout (ProtectedRoute)
  /admin
  /admin/events
  /admin/events/new
  /admin/events/:eventId/edit
  /admin/events/:eventId/setup
  /admin/venues
  /admin/artists
  /admin/bookings
  /admin/refunds
  /admin/settings
```

Protected admin routes:

- If no token: redirect to `/admin/login`.
- If token exists but API returns 401: clear token and redirect to login.

## 8. Layout Structure

### 8.1 CustomerLayout

Sections:

- Header: logo, nav links, admin link secondary.
- Main content: constrained width, page-specific.
- Footer: project/demo info.

Customer pages should avoid heavy dashboard patterns. They should feel like a booking website:

- Event cards in grid.
- Event detail with prominent event banner, date/location/ticket selection.
- Booking flow with step indicator.
- Sticky summary panel on desktop, bottom summary bar on mobile.

### 8.2 AdminLayout

Sections:

- Sidebar: Dashboard, Events, Venues, Artists, Bookings, Refunds, Settings.
- Topbar: current page title, admin account, logout.
- Content area: table/list/form sections.

Admin dashboard should be dense but readable:

- Metric cards for active events, pending bookings, pending refunds.
- Recent bookings table.
- Operational alerts such as refunds pending or events missing setup.

## 9. Component Structure

Recommended folder structure:

```txt
src/
  api/
    client.ts
    events.ts
    reservations.ts
    payments.ts
    tickets.ts
    adminAuth.ts
    adminEvents.ts
    adminVenues.ts
    adminArtists.ts
    adminBookings.ts
    adminRefunds.ts
  components/
    common/
      Button.tsx
      Input.tsx
      Select.tsx
      Textarea.tsx
      Badge.tsx
      Card.tsx
      Modal.tsx
      Table.tsx
      EmptyState.tsx
      LoadingState.tsx
      ErrorState.tsx
      ConfirmDialog.tsx
    layout/
      CustomerLayout.tsx
      AdminLayout.tsx
      AdminSidebar.tsx
      AdminTopbar.tsx
    events/
      EventCard.tsx
      EventGrid.tsx
      EventSearchBar.tsx
      EventStatusBadge.tsx
      EventHero.tsx
      SchedulePicker.tsx
      EventDayPicker.tsx
      TicketTypePicker.tsx
    booking/
      BookingStepIndicator.tsx
      CustomerInfoForm.tsx
      TicketQuantityControl.tsx
      BookingSummary.tsx
      ReservationTimer.tsx
    payment/
      PaymentMethodSelector.tsx
      PaymentInstructionPanel.tsx
      PaymentStatusBadge.tsx
    tickets/
      TicketCard.tsx
      TicketQRCode.tsx
      TicketStatusBadge.tsx
    admin/
      AdminMetricCard.tsx
      AdminDataToolbar.tsx
      EventForm.tsx
      VenueForm.tsx
      ArtistForm.tsx
      ScheduleForm.tsx
      EventDayForm.tsx
      TicketConfigForm.tsx
      ArtistAssignmentPanel.tsx
      BookingTable.tsx
      RefundTable.tsx
  pages/
    customer/
    admin/
  hooks/
  store/
  types/
  utils/
```

## 10. API Integration Plan

### 10.1 API Client

Create a shared API client around `fetch`:

- Base URL from `VITE_API_URL`, default `http://localhost:8000/api/v1`.
- JSON request/response helpers.
- Automatic `Authorization` header for admin routes when token exists.
- Normalize errors into `{ message, status, details }`.

### 10.2 Public API Modules

`api/events.ts`

- `getEvents(params?: { skip?: number; limit?: number })`
- `getEvent(eventId: number)`

`api/reservations.ts`

- `createReservation(payload: ReservationRequest)`

`api/payments.ts`

- `createPayment(payload: PaymentCreate)`
- `simulatePaymentWebhook(payload: PaymentWebhookPayload)` for demo-only UI if allowed.

`api/tickets.ts`

- `getTicketsByBooking(bookingId: number)`
- `getTicketByCode(ticketCode: string)`

### 10.3 Admin API Modules

`api/adminAuth.ts`

- `login(username: string, password: string)`

`api/adminEvents.ts`

- `createEvent(payload)`
- `updateEvent(eventId, payload)`
- `cancelEvent(eventId, reason)`
- `createSchedule(payload)`
- `createEventDay(payload)`
- `createTicketConfig(payload)`

`api/adminVenues.ts`

- `listVenues()`
- `getVenue(id)`
- `createVenue(payload)`
- `updateVenue(id, payload)`

`api/adminArtists.ts`

- `listArtists()`
- `createArtist(payload)`
- `assignArtist(payload)`

`api/adminBookings.ts`

- `listBookings()`

`api/adminRefunds.ts`

- `listPendingRefunds()`
- `processAllRefunds()`

## 11. Type Structure

Frontend types should mirror backend schemas:

```txt
types/event.ts
types/schedule.ts
types/venue.ts
types/artist.ts
types/ticketConfig.ts
types/booking.ts
types/payment.ts
types/ticket.ts
types/refund.ts
types/api.ts
```

Important status unions:

```ts
type EventStatus = "ACTIVE" | "CANCELLED" | "INACTIVE";
type BookingStatus = "PENDING_PAYMENT" | "PAID" | "PAYMENT_FAILED" | "CANCELLED" | "REFUNDING" | "REFUNDED" | "REFUND_FAILED";
type PaymentStatus = "INITIATED" | "SUCCESS" | "FAILED" | "EXPIRED";
type TicketStatus = "VALID" | "USED" | "CANCELLED" | "REFUNDED";
type RefundStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
```

## 12. State Management Plan

Avoid Redux initially. Use React state + Context + custom hooks because the project is medium-sized and easier to demo.

Global state:

- `AuthContext`: admin token, login/logout, auth status.
- `BookingDraftContext` or local storage: selected event, schedule, event day, ticket configs, quantities, customer info.

Server state:

- For first implementation, use custom hooks with `useEffect`, `useState`, `useCallback`.
- Later improvement: add TanStack Query if project allows dependency growth.

Local page state:

- Filters/search/sort in event list.
- Form data in booking/admin forms.
- Modal open/close states.
- Table pagination state.

Persisted state:

- Admin token in `localStorage`.
- Last booking ID optionally in `sessionStorage` for checkout recovery.

## 13. Data Flow Chính

### 13.1 Customer Booking Data Flow

```txt
EventListPage
  -> getEvents()
  -> customer selects event

EventDetailPage
  -> getEvent(eventId)
  -> customer selects schedule/day/ticket configs
  -> BookingDraft state

BookingPage
  -> customer fills information
  -> createReservation()
  -> receives BookingRead
  -> navigate /checkout/:bookingId

CheckoutPage
  -> createPayment({ booking_id, payment_method })
  -> show payment transaction/status
  -> after success/demo webhook, navigate /booking/:bookingId/tickets

BookingTicketsPage
  -> getTicketsByBooking(bookingId)
  -> render ticket cards and QR
```

### 13.2 Admin Setup Data Flow

```txt
AdminLoginPage
  -> login()
  -> store token
  -> navigate /admin

AdminVenuePage
  -> create/list/update venues

AdminEventFormPage
  -> create event

AdminEventSetupPage
  -> create schedule with event_id + venue_id
  -> create event days
  -> create ticket configs
  -> create/list artists
  -> assign artists to event day

AdminBookingPage
  -> list bookings

AdminRefundPage
  -> list pending refunds
  -> process all refunds
```

## 14. Customer Website Structure

### HomePage

Purpose:

- Introduce booking platform.
- Show featured/upcoming active events.
- Provide clear CTA to browse events.

Sections:

- Header/nav.
- Search/filter strip.
- Featured events grid.
- Simple explanation of booking steps.

### EventListPage

Purpose:

- Browse all active events.

Features:

- Search by event name.
- Filter by status if backend later supports.
- Event cards with banner, status, short description.
- Empty state when no events.

### EventDetailPage

Purpose:

- Help customer decide and start booking.

Sections:

- Event banner and summary.
- Description.
- Schedule/day/ticket selection.
- Artist list if backend provides it.
- CTA: "Book tickets".

Backend TODO:

- Provide event detail with schedules, venue, days, ticket configs, remaining quantity and artists.

### BookingPage

Purpose:

- Capture booking details and create reservation.

Layout:

- Left: customer info and ticket selection.
- Right: booking summary.
- Mobile: summary becomes sticky bottom or collapsible panel.

Validation:

- Name required.
- Phone required.
- Email valid.
- Payment account required for refunds.
- Quantity > 0.

### CheckoutPage

Purpose:

- Start payment and show payment instructions.

States:

- Payment not started.
- Payment initiated.
- Payment success.
- Payment failed.
- Reservation expired.

Backend TODO:

- Provide payment QR/payment URL/instructions and payment expiry.
- Provide endpoint to fetch booking/payment status.

### Ticket Pages

Purpose:

- Display e-tickets after successful payment.

Features:

- Ticket QR image.
- Ticket code.
- Ticket status.
- Event/date/venue info if backend returns enriched detail.

Backend TODO:

- `ETicketDetailRead` exists but current route returns `ETicketRead`; route could return enriched ticket detail.

## 15. Admin Dashboard Structure

### AdminDashboardPage

Widgets:

- Active events count.
- Pending bookings count.
- Pending refunds count.
- Recent bookings table.
- Quick actions: create event, create venue, add artist.

Backend TODO:

- Add dashboard summary endpoint or compute using existing list endpoints.

### AdminEventListPage

Features:

- Event table with event name, status, created_at.
- Actions: edit, setup, cancel.
- Status filters.

Backend TODO:

- Add `GET /api/v1/admin/events` to list all events, including cancelled/inactive.
- Add `GET /api/v1/admin/events/{event_id}` if admin edit page needs full data.

### AdminEventSetupPage

Purpose:

- Configure one event end-to-end.

Panels:

- Event basic info summary.
- Schedule list by venue.
- Event days under selected schedule.
- Ticket config table.
- Artist assignment by event day.
- Validation warnings: capacity exceeded, backup artist count < 2.

Backend TODO:

- Add list/get endpoints for schedules by event, days by schedule, ticket configs by schedule, artists assigned by event day.
- Enforce or expose backup artist validation result.

### AdminVenuePage

Features:

- Venue table.
- Create/edit modal or side panel.
- Capacity visible because it affects ticket config.

### AdminArtistPage

Features:

- Artist table.
- Create artist form.
- Optional image URL preview.

Backend TODO:

- Add update/delete artist APIs if full CRUD is required.

### AdminBookingPage

Features:

- Booking table.
- Status badges.
- Search by customer/email/phone locally.
- Basic details drawer if backend supports detail later.

Backend TODO:

- Add `GET /api/v1/admin/bookings/{booking_id}` for detail.
- Add filters by status/date.

### AdminRefundPage

Features:

- Pending refunds table.
- Process all button.
- Status result feedback.

Backend TODO:

- Add all refunds list and retry single refund endpoint for better admin UX.

## 16. Responsive Strategy

Breakpoints:

- Mobile: < 640px.
- Tablet: 640px - 1024px.
- Desktop: > 1024px.

Customer:

- Event cards: 1 column mobile, 2 columns tablet, 3 columns desktop.
- Booking form: single column mobile; two-column form + summary desktop.
- Header nav collapses into simple menu on mobile.

Admin:

- Desktop: persistent sidebar.
- Tablet/mobile: sidebar collapses into drawer.
- Tables: use horizontal scroll or card-style rows on mobile.
- Forms: full-width stacked inputs on mobile.

## 17. Loading, Error, Empty States

Every API-backed page should define:

- Loading state: skeleton/card/table placeholder.
- Error state: concise message + retry button.
- Empty state: explanation + next action.

Examples:

- Event list empty: "No active events yet."
- Booking no tickets: "No tickets have been issued for this booking yet."
- Admin venues empty: "Create a venue before creating schedules."
- Refunds empty: "No pending refunds."

Form error handling:

- Field-level validation before submit.
- API error banner after submit.
- Disable submit while request is pending.
- Keep user input when API fails.

## 18. API Gaps And Backend TODOs

These gaps should be considered before or during frontend implementation:

1. Public event detail is too shallow for full booking UI.
   - Need schedules, venue, event_days, ticket_configs, remaining_quantity, artists.

2. Admin event list/get APIs are missing.
   - Need list all events, get event by id, possibly include cancelled/inactive.

3. Admin setup read APIs are missing.
   - Need list schedules by event.
   - Need list event days by schedule.
   - Need list ticket configs by schedule.
   - Need list assigned artists by event_day.

4. Payment create response lacks demo payment UX fields.
   - Useful fields: payment instructions, QR URL/base64, expired_at, amount, reference code.

5. Booking detail endpoint is missing for customer/admin.
   - Customer checkout refresh needs `GET /booking/{booking_id}` or similar.

6. Ticket detail route returns basic ticket only.
   - UI would benefit from event_name, venue_name, date, ticket_type, customer_name.

7. Admin artist update/delete missing.

8. Admin venue delete missing.

9. Refund single retry/manual refund missing.

10. Route `backend/app/api/v1/ticket.py` appears legacy and does not match current ticket schema.
    - It is not included in `main.py`; frontend should use `tickets.py` routes only.

## 19. Implementation Roadmap

### Phase 1 - Frontend Foundation

- Replace current demo types with backend-aligned types.
- Build shared API client.
- Build common UI components.
- Add layouts: `CustomerLayout`, `AdminLayout`.
- Add auth context and protected admin route.

### Phase 2 - Customer Browse

- Implement home page.
- Implement event list page.
- Implement event detail page using available data.
- Add TODO fallback UI for missing schedule/ticket nested data.

### Phase 3 - Customer Booking

- Implement booking draft state.
- Implement booking form.
- Integrate `POST /api/v1/reservations`.
- Implement checkout page with `POST /api/v1/payments/create`.
- Implement ticket list page.

### Phase 4 - Admin Core

- Implement admin login.
- Implement admin dashboard shell.
- Implement venue management.
- Implement artist management.
- Implement event create/edit.

### Phase 5 - Admin Event Setup

- Implement schedule creation.
- Implement event day creation.
- Implement ticket config creation.
- Implement artist assignment.
- Add validation messaging for capacity and backup artists.

### Phase 6 - Admin Operations

- Implement bookings table.
- Implement refunds page.
- Implement cancel event action.
- Add status badges and operational alerts.

### Phase 7 - Polish And Demo Readiness

- Improve responsive behavior.
- Add loading/error/empty states everywhere.
- Add mock/demo data fallback only where backend API is missing.
- Verify end-to-end demo path:
  - Admin creates venue/event/setup.
  - Customer books.
  - Payment simulated.
  - Ticket generated.
  - Admin views booking/refund.

## 20. Final Architecture Proposal

Use a feature-oriented React structure with clear separation:

- API clients per backend domain.
- Types per backend schema domain.
- Common components for UI primitives.
- Domain components for booking/events/admin.
- Pages as route-level containers.
- Context only for auth and booking draft.

Do not change backend architecture while implementing frontend. Any backend mismatch should be recorded as TODO and handled with graceful UI fallback until backend APIs are added.
