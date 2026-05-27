# UI_Structure.md – Kế hoạch nâng cấp giao diện Event Booking Platform

> Tài liệu này là bản kế hoạch và đặc tả thiết kế cho đợt refactor UI/UX của phần frontend (Vite + React + TypeScript). Mục tiêu: giúp trang web đặt vé concert/event trông hiện đại, chuyên nghiệp, dễ dùng hơn mà không thay đổi business logic, API endpoint, schema, hay tên các function/hook đang dùng.

---

## 1. Tổng quan stack frontend hiện tại

- **Build / Tooling**: Vite 5, TypeScript 5, React 18.
- **Routing**: `react-router-dom@6` (file `src/App.tsx`, layout `CustomerLayout`).
- **State / data**: React state cục bộ + hook tự viết `useAsync` (`src/hooks/useAsync.ts`). Không có Redux/Zustand/React Query.
- **API client**: `src/api/client.ts` (fetch wrapper) + module wrapper `events.ts`, `payments.ts`, `reservations.ts`, `tickets.ts`.
- **CSS**: Pure CSS thuần trong `src/styles/globals.css` (không Tailwind, không CSS Modules, không styled-components). Class name BEM-ish: `.event-card`, `.summary-panel`, `.hero`, ...
- **Không có UI library** (không MUI / Ant Design / Radix). Mọi component được code thủ công.

Việc giữ stack đơn giản này là tích cực: refactor UI không cần đưa thêm dependency lớn. Đợt nâng cấp này tiếp tục dùng **CSS thuần** + biến CSS (`var(--...)`), không thêm Tailwind hay framework UI mới, để tránh phá vỡ build và config hiện tại.

---

## 2. Cấu trúc giao diện hiện tại

### 2.1. Routing (customer)

Từ `src/App.tsx`:

| Route | Page component | Mục đích |
|-------|----------------|----------|
| `/` | `HomePage` | Hero + 6 event nổi bật |
| `/events` | `EventListPage` | Danh sách event, có search theo tên |
| `/events/:eventId` | `EventDetailPage` | Banner + mô tả + danh sách schedule, ticket config |
| `/events/:eventId/book` | `BookingPage` | Form đặt vé: thông tin khách + chọn schedule, day, seat |
| `/checkout/:bookingId` | `CheckoutPage` | Tạo payment demo + simulate webhook |
| `/booking/:bookingId/tickets` | `BookingTicketsPage` | Danh sách e-ticket sau khi thanh toán |
| `/tickets/:ticketCode` | `TicketDetailPage` | Chi tiết 1 e-ticket theo mã |

> Lưu ý: header có link `/tickets/lookup` nhưng route thực tế chỉ có `/tickets/:ticketCode`. Ticket lookup hiện trả về placeholder, chưa có form nhập mã. (Sẽ ghi chú vào phần "Vấn đề logic phát hiện trong lúc sửa UI" bên dưới.)

### 2.2. Layout

- **`CustomerLayout`** (`src/components/layout/CustomerLayout.tsx`) – wrapper duy nhất cho mọi page customer:
  - `<header class="site-header">` chứa logo `Event Booking` + 2 link nav (`Events`, `Ticket lookup`).
  - `<main class="main-content">` chứa `Outlet`.
  - `<footer class="site-footer">` text 1 dòng: "FastAPI + React event ticket booking demo".

### 2.3. Components tái sử dụng

| Component | File | Vai trò |
|-----------|------|---------|
| `Button` | `components/common/Button.tsx` | Wrapper `<button>` có 4 variant: primary, secondary, danger, ghost |
| `Badge` | `components/common/Badge.tsx` | Tô màu badge theo status (ACTIVE, PAID, ...) |
| `PageHeader` | `components/common/PageHeader.tsx` | Eyebrow + title + description + actions |
| `AsyncState` | `components/common/AsyncState.tsx` | `LoadingState`, `ErrorState`, `EmptyState` |
| `EventCard` | `components/events/EventCard.tsx` | Card event trong grid |
| `TicketCard` | `components/tickets/TicketCard.tsx` | Card e-ticket có QR |
| `BookingSummary` | `components/booking/BookingSummary.tsx` | Sidebar tóm tắt đặt vé |

### 2.4. Style hiện tại (`globals.css`)

- 1 file CSS duy nhất ~720 dòng, dùng biến CSS cho màu chính.
- Palette hiện tại: `--primary: #1463ff` (xanh dương), `--bg: #f6f8fb` (xám nhạt), `--surface: #fff`, `--text: #102033`.
- Typography: dùng font `Inter`, fallback `system-ui`. Tuy nhiên **không có `<link>` Google Fonts trong `index.html`** → trên Windows fallback sang `Segoe UI`.
- Border-radius khá nhỏ (`8px`), chưa thực sự "modern".
- Shadow nhẹ (`0 18px 45px rgba(15, 23, 42, 0.08)`).
- Có responsive breakpoint ở `860px` và `560px`.

---

## 3. Các vấn đề UI/UX hiện có

### 3.1. Giao diện chung

1. **Brand quá nhẹ / không có cảm xúc concert**: chỉ là chữ `Event Booking` thường, font không bold, không có icon, header trông như admin tool hơn là website bán vé concert.
2. **Hero section thiếu chiều sâu**: ảnh Unsplash mặc định, không có badge / stat / dual CTA (Browse + How it works), không có pattern hay glow để gây ấn tượng.
3. **Color palette quá "doc"**: xanh `#1463ff` + xám nhạt = cảm giác B2B/dashboard, không phải concert. Concert/event thường cần một accent màu nóng (đỏ hồng, tím gradient).
4. **Typography đơn điệu**: chỉ một font (Inter fallback), không có weight contrast rõ giữa heading và body, không có letter-spacing cho display heading.
5. **Border-radius và shadow chưa nhất quán**: card 8px, button 8px, badge pill 999px. Cảm giác "góc cứng".
6. **Không có icon system**: tất cả UI đều thuần chữ, thiếu visual cue (icon location, calendar, ticket, ...).
7. **Footer 1 dòng "demo"**: trông tạm bợ, thiếu cấu trúc (cột brand / liên hệ / chính sách / mạng xã hội).
8. **Site nav không highlight active** rõ ràng – `.site-nav a.active` chỉ đổi background xám nhẹ, gần như không thấy được.

### 3.2. Trang chủ (`HomePage`)

- Hero: chỉ 1 dòng tiêu đề + 1 dòng mô tả + 1 button. Thiếu trust signal, stat ("10K+ vé đã bán"), mô-tip thị giác.
- "Active events" hiển thị toàn bộ event không phân loại (không có "Sắp diễn ra", "Bán chạy", "Mới mở").
- Refresh button đặt cạnh tiêu đề nhưng không có giá trị về mặt UX cho người dùng cuối (chỉ hữu ích cho dev). Có thể giữ nhưng cần làm subtle hơn.
- Thiếu các section bổ trợ: "Cách đặt vé" (3 step), "Tại sao chọn chúng tôi", CTA cuối trang.

### 3.3. Danh sách event (`EventListPage`)

- Search box dài 420px, refresh button cạnh, không có filter theo city/date/price → trông trống.
- Không có empty illustration, chỉ một dòng text.

### 3.4. Event card (`EventCard`)

- Card **không hiển thị**: ngày diễn, địa điểm, giá vé thấp nhất – là 3 thông tin quan trọng nhất khi quyết định mua vé concert. Card chỉ có: ảnh, tên, status badge, mô tả, button "View details".
- Mô tả thường dài → gây tràn / không cap dòng → cần `line-clamp`.
- Nút CTA `button-secondary` (màu nhạt) → ít kêu gọi click. Card cũng nên clickable toàn bộ.

### 3.5. Event detail (`EventDetailPage`)

- Detail hero 2 cột (`minmax(260px, 420px) 1fr`) – ảnh bên trái, nội dung bên phải. Trên màn lớn ảnh khá nhỏ (max 420px) trong khi page rộng 1160px → vùng phải nhiều khoảng trống.
- Mỗi `schedule` được hiển thị dạng `panel`, ticket config và event_days đều list ngang dạng `summary-row`. Khá khô. Không có phân tách rõ giữa "loại vé" và "ngày diễn".
- Button "Select seats" nằm trong từng schedule, dễ nhầm với nút CTA chính ở trên (`Book tickets`).
- Không có sticky CTA ở mobile.

### 3.6. Booking page (`BookingPage`)

- Form 2 cột (4 input personal + 2 select) trông như form đăng ký hành chính, không có grouping "Thông tin liên hệ" / "Chi tiết vé".
- Khu "Available seats" hiện danh sách button full-width xếp dọc → với 50–100 ghế sẽ rất dài. Cần grid `auto-fill` để chọn seat dạng chip/tile.
- Không có visual seat map. (Giữ behavior list nhưng cần presentation tốt hơn.)
- Sticky `BookingSummary` sidebar trên desktop là tốt, nhưng phần trống dưới cùng khi ít vé chọn → cần fill bằng hint hoặc info.

### 3.7. Checkout (`CheckoutPage`)

- 1 `panel` chứa booking receipt + nút "Create payment" + thông tin payment + nút "Simulate success webhook". Cả flow nhồi vào một khối, không có step indicator → user khó biết đang ở bước nào.
- Status badge và amount nhỏ, không nổi bật.
- Khi đã thanh toán xong, không có gợi ý "Tiếp tục xem vé" rõ ràng – nút chỉ là button-secondary mờ.

### 3.8. Ticket card (`TicketCard`) & ticket pages

- QR code khung vuông 140px ở mobile thì stack về 1 cột, trông tạm ổn. Tuy nhiên thiếu "stub" perforation hoặc kiểu vé xé – cảm giác chưa "ra ticket".
- Không có nút Download / Share / Add to wallet (giữ phạm vi UI, không gọi API mới).
- `TicketDetailPage` ở chế độ `lookup` chỉ là placeholder, không có form nhập mã → trải nghiệm rất kém. Có thể bổ sung form input nhỏ + button submit (giữ logic gọi cùng API `getTicketByCode`).

### 3.9. Loading / Error / Empty

- Cả 3 đều là 1 box giống nhau chỉ khác màu nền. Không có skeleton placeholder cho event card. Loading khá trống.

---

## 4. Design system đề xuất (cho đợt refactor này)

### 4.1. Color tokens

Dùng biến CSS, kết hợp giữa "tin cậy" (deep ink) và "concert" (electric magenta/violet gradient).

```css
--page-bg:       #f7f8fc;   /* nền page */
--surface:       #ffffff;
--surface-soft:  #f1f4fb;
--surface-muted: #eef0f6;
--border:        #e3e7f1;
--border-strong: #cbd2e3;
--text:          #0f172a;
--text-muted:    #5b6478;
--text-soft:     #8892a6;

/* Brand */
--primary:        #6d28d9;  /* violet 700 */
--primary-strong: #5b21b6;
--primary-soft:   #ede9fe;
--accent:         #ec4899;  /* pink 500 */
--accent-soft:    #fce7f3;
--gradient-hero:  linear-gradient(135deg, #4c1d95 0%, #6d28d9 35%, #db2777 100%);
--gradient-cta:   linear-gradient(135deg, #6d28d9 0%, #ec4899 100%);

/* Semantic */
--success: #16a34a; --success-soft: #dcfce7;
--warning: #d97706; --warning-soft: #fef3c7;
--danger:  #dc2626; --danger-soft:  #fee2e2;
--info:    #2563eb; --info-soft:    #dbeafe;

/* Effects */
--shadow-sm: 0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05);
--shadow-md: 0 8px 24px -8px rgba(15,23,42,.16), 0 4px 8px -4px rgba(15,23,42,.08);
--shadow-lg: 0 24px 48px -16px rgba(76,29,149,.22), 0 8px 16px -8px rgba(15,23,42,.10);
--ring: 0 0 0 4px rgba(109,40,217,.18);
```

### 4.2. Typography

- **Display font** (heading): `"Plus Jakarta Sans"` qua Google Fonts (weight 600, 700, 800). Fallback `Inter`, `Segoe UI`.
- **Body**: `"Inter"` (weight 400, 500, 600).
- Scale (clamp cho responsive):
  - `h1` display: `clamp(2.25rem, 4.5vw, 3.5rem)`, weight 800, letter-spacing `-0.02em`.
  - `h2`: `clamp(1.5rem, 2.4vw, 2rem)`, weight 700, letter-spacing `-0.01em`.
  - `h3`: `1.125rem`, weight 700.
  - body: `0.975rem`, line-height `1.55`.
  - small/muted: `0.85rem`.

### 4.3. Spacing & radius

- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px.
- Radius: `--radius-sm: 8px`, `--radius-md: 14px`, `--radius-lg: 20px`, `--radius-pill: 999px`.
- Card mặc định: `--radius-lg` (20px), shadow `--shadow-md`, border `1px solid var(--border)`.

### 4.4. Components

- **Button**: 3 size (sm/md/lg). Primary dùng gradient `--gradient-cta`, hover slight lift + shadow. Variants: primary, secondary (soft), ghost, danger, outline (mới).
- **Badge**: pill, có biến `solid` (nền đậm) và `soft` (nền pastel). Default = soft, tự suy theo status như hiện tại.
- **Card**: thêm class chung `.surface-card` để tái dùng. Hover lift nhẹ.
- **Chip / Tag**: cho metadata trong card (`Hà Nội`, `27/5/2026`, `Từ 500.000đ`).
- **Skeleton**: thêm `.skeleton` (background gradient animation) cho loading event card.

### 4.5. Iconography

Không add icon library. Dùng inline SVG nhỏ trong markup khi cần (icon location, calendar, ticket, arrow). Có thể tạo helper `Icon.tsx` chứa các SVG cần thiết.

### 4.6. Responsive

- Breakpoint chính: 1024px, 768px, 560px.
- Mobile-first cho nav (horizontal scroll), grid event xuống 1 cột < 560px, 2 cột < 1024px, 3 cột ≥ 1024px.
- Sticky CTA "Book tickets" ở event detail (mobile).

---

## 5. Kế hoạch sửa từng file / page / component

### 5.1. Sửa (refactor) – KHÔNG đổi public API

| File | Thay đổi chính |
|------|---------------|
| `index.html` | Thêm `<link>` Google Fonts (Plus Jakarta Sans + Inter). Đặt `<title>` mô tả hơn: "Eventify – Concert & Event Tickets". |
| `src/styles/globals.css` | **Viết lại toàn bộ**: tokens mới, typography, layout helpers, component classes (`.surface-card`, `.chip`, `.skeleton`, ...). Giữ tên class cũ mà các component đang dùng (`.event-card`, `.hero`, `.summary-panel`, ...) – chỉ đổi cách hiển thị. |
| `src/components/layout/CustomerLayout.tsx` | Header có brand mới (logo svg + gradient text), nav active state rõ, thêm CTA "Book now". Footer 3 cột (brand + nav + copyright). |
| `src/pages/customer/HomePage.tsx` | Hero gradient + badge + dual CTA + stats; section "Featured events" với heading mới; thêm section "How it works" (3 step) và CTA strip cuối. Giữ nguyên `useAsync(() => getEvents(...))`. |
| `src/pages/customer/EventListPage.tsx` | Header đẹp hơn, search box dùng icon SVG bên trong, hiển thị count results. Loading dùng skeleton. Giữ logic filter `query`. |
| `src/components/events/EventCard.tsx` | Card mới: ảnh ratio 16/10, badge nổi trên ảnh, meta chip (city, date, from price), title clamp 2 dòng, CTA "View details" arrow. Toàn bộ card clickable (wrap `<Link>`). Lấy thêm dữ liệu từ event nếu có trong `EventSummary`/`EventRead` mở rộng – nhưng vì `EventSummary` hiện chỉ có `event_name`, `description`, `banner_url`, `status`, `number_of_days` nên các meta khác để optional/empty. Không gọi API mới. |
| `src/pages/customer/EventDetailPage.tsx` | Hero stack ảnh full-width + content phía dưới; phân chia rõ "Giới thiệu", "Lịch diễn", "Loại vé"; sticky bottom CTA mobile. Giữ nguyên data shape. |
| `src/pages/customer/BookingPage.tsx` | Chia rõ 3 nhóm: "Thông tin liên hệ", "Lịch & ngày diễn", "Chọn vé". Seat list thành grid chip 3–5 cột. Vẫn dùng `toggleSeat`, `createReservation`, navigate giữ nguyên. |
| `src/components/booking/BookingSummary.tsx` | Sidebar gọn hơn, có icon, hiển thị số vé chọn và tổng tiền nổi bật, hint nếu chưa chọn vé. Không thay đổi prop. |
| `src/pages/customer/CheckoutPage.tsx` | Step indicator 3 bước (Reservation → Payment → Tickets). Card receipt nổi bật. Khi thành công, CTA lớn "View my tickets". |
| `src/pages/customer/BookingTicketsPage.tsx` | PageHeader có icon + breadcrumb-ish text. Empty state có illustration nhẹ (SVG inline). |
| `src/pages/customer/TicketDetailPage.tsx` | Chế độ `lookup`: thêm form `<input>` + button "Look up" navigate tới `/tickets/{value}`. Tạm thời chỉ gọi `getTicketByCode` khi không phải lookup (`enabled` pattern bằng cách return promise pending). |
| `src/components/tickets/TicketCard.tsx` | Style "ticket-stub": có notch hai bên, dashed divider, QR khung lớn hơn, info layout 2 cột. |
| `src/components/common/Button.tsx` | Thêm prop `size?: "sm"\|"md"\|"lg"` và variant `outline`. Default vẫn `primary`/`md` – không phá call site cũ. |
| `src/components/common/Badge.tsx` | Thêm prop `variant?: "soft"\|"solid"` (default `soft`). Vẫn auto-map status như cũ. |
| `src/components/common/AsyncState.tsx` | `LoadingState` nhận optional `variant: "card"` để render skeleton placeholder (dùng cho event grid). Mặc định behavior cũ. |
| `src/components/common/PageHeader.tsx` | Thêm slot `eyebrowIcon?: ReactNode` (optional). Không phá props cũ. |

### 5.2. Tạo mới

| File mới | Lý do |
|----------|-------|
| `src/components/common/Icon.tsx` | Tập hợp SVG inline (calendar, location, ticket, arrow-right, search, check, sparkles, qr...). |
| `src/components/common/Skeleton.tsx` | Block skeleton dùng cho card grid khi loading. |

### 5.3. KHÔNG đụng tới

- Toàn bộ `src/api/*.ts` (giữ endpoint, function signature).
- `src/hooks/useAsync.ts`.
- `src/types/*.ts` (đợt này cố gắng không sửa).
- `src/utils/format.ts`.
- Backend, schema, .env.

---

## 6. Nguyên tắc khi refactor

1. **Không đổi import path** mà các page khác đang dùng. Mọi component vẫn export với cùng tên.
2. **Không đổi prop bắt buộc** đã có. Chỉ thêm prop optional.
3. **Không đổi tên class CSS** đang được tham chiếu trong TSX, trừ khi mình thay luôn TSX. Khi đổi, đổi đồng bộ ở cả CSS + TSX.
4. **Giữ key tiếng Anh trong UI** vì codebase hiện tại dùng tiếng Anh. Có thể thêm vài cụm tiếng Việt nếu phù hợp với context demo (đang format VND ở `format.ts`).
5. **Test bằng `npm run build`** (`tsc && vite build`) sau khi xong để chắc không vỡ TypeScript.

---

## 7. Vấn đề logic / API phát hiện trong lúc rà UI (KHÔNG tự ý sửa)

1. **`/tickets/lookup` không có form thực sự** – `TicketDetailPage` xử lý case `ticketCode === "lookup"` bằng `EmptyState`, nhưng `useAsync(() => getTicketByCode("lookup"))` vẫn được gọi và sẽ báo 404 trước khi component return. Một request thừa + có thể flash error. UI sẽ thêm form thực, còn việc gate API call có điều kiện nên do logic owner xử lý sau.
2. **`CheckoutPage` đọc booking từ `location.state`** – nếu user F5 hoặc paste URL trực tiếp, `booking` undefined → receipt không hiển thị nhưng vẫn cho phép tạo payment. Đợt này UI sẽ show fallback nhẹ nhàng, không sửa logic.
3. **`EventCard` thiếu meta**: `EventSummary` chỉ trả `event_id, event_name, description, banner_url, status, number_of_days`. Muốn card hiển thị "Tp.HCM • 27/5 • Từ 500.000đ" cần API trả thêm field hoặc gọi `/events/:id` per card. Đợt này: chỉ hiển thị `number_of_days` + `status`, các meta khác để placeholder/bỏ qua.
4. **`Badge` map status case-sensitive uppercase**: nếu backend trả `Active` lower thì badge default `neutral`. Không sửa, chỉ note.
5. **Route `/admin/*` không có** trong `App.tsx` (mặc dù README đề cập) → hiện UI customer là duy nhất. Đợt nâng cấp này không tạo trang admin mới.
6. **Header link `/tickets/lookup` ↔ route `/tickets/:ticketCode`**: `lookup` đang match `:ticketCode` thay vì là route riêng. Sau đợt này có thể tách thành route `/tickets-lookup` rõ ràng, nhưng đó là refactor logic, để lại.

---

## 8. Lộ trình thực hiện (sẽ làm theo thứ tự)

1. Viết lại `globals.css` (foundation).
2. Sửa `index.html` (font + title).
3. Update `CustomerLayout` (header + footer mới).
4. Tạo `Icon.tsx` + `Skeleton.tsx`.
5. Sửa common: `Button`, `Badge`, `AsyncState`, `PageHeader` (thêm prop optional, không phá cũ).
6. Sửa `EventCard`.
7. Sửa `HomePage`.
8. Sửa `EventListPage`.
9. Sửa `EventDetailPage`.
10. Sửa `BookingPage` + `BookingSummary`.
11. Sửa `CheckoutPage`.
12. Sửa `BookingTicketsPage`, `TicketDetailPage`, `TicketCard`.
13. Chạy `npm run build` để verify TypeScript & Vite không vỡ.
14. Liệt kê tóm tắt thay đổi cho user.

---

## 9. Tiêu chí "xong"

- [x] Có `UI_Structure.md` với cấu trúc, vấn đề, kế hoạch, design system.
- [ ] Tất cả page customer vẫn navigate được như cũ.
- [ ] `npm run build` (`tsc && vite build`) pass.
- [ ] Không có file API/types/hooks bị thay đổi behavior.
- [ ] Header / hero / event card / detail / booking / checkout / tickets đều có visual mới, responsive desktop + mobile.
