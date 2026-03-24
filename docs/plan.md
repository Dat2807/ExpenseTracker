---
name: Plan dự án quản lý tài chính (bản chi tiết hơn)
overview: "Plan cập nhật theo flow mới: Report theo tháng là trung tâm, vào từng Report để quản lý Budget/Transactions, giữ Category + QuickNotes ở mức global theo user, i18n EN/VI làm ở phase sau."
todos: []
isProject: false
---

# Plan dự án quản lý tài chính (bản chi tiết hơn)

## 1. Chốt yêu cầu nghiệp vụ

- **User & Auth**: mỗi user có tài khoản riêng, chỉ thấy dữ liệu của mình.  
- **Category tổng**:
  - Có 2 nhóm: **Category thu** và **Category chi**.  
  - **Mỗi user tự định nghĩa bộ Category riêng** (per user), không dùng chung.
- **Monthly Report là trung tâm**:
  - Mỗi report tương ứng đúng **1 tháng** (`year`, `month`) của user.  
  - User vào danh sách report -> chọn report tháng cụ thể -> thao tác budget/transactions trong report đó.
- **Budget theo Category trong report tháng**:
  - Trong mỗi report tháng, cho **mỗi Category chi**, user nhập `planned_amount`.  
  - Budget không đứng màn top-level riêng; là nghiệp vụ bên trong report.
- **Transaction**:
  - Field chính: date, description (note chính), amount, category, created_at.  
  - **Không còn field type** trên Transaction; thu/chi được suy ra từ `category.type`.  
  - Category bắt buộc, và Category đã biết trước (chọn từ list).
- **Transaction trong report tháng (MVP)**:
  - Nhập **bằng nút +** (form tay) bên trong report tháng.  
  - Chưa bắt buộc có import Excel ở MVP; có thể để phase sau.
- **Ghi chú nhanh (Notes)**:
  - Có một nơi riêng để tạo/lưu các note mẫu (QuickNotes) per user (giống Category nhưng là text).  
  - Khi nhập description, có một icon (ví dụ chữ N) để mở popup, chọn note mẫu, tự dán vào description.
- **i18n Anh/Việt**:
  - FE: dùng `en.json` / `vi.json` trong 1 thư mục (ví dụ `src/i18n/`), toàn bộ label/màn hình chính dùng key.  
  - **BE chỉ gửi mã (code) lỗi/thông báo**, FE sẽ dựa vào mã đó và i18n hiện tại (EN/VN) để chọn text hiển thị. BE có thể kèm theo message tiếng Anh mặc định để debug.

---

## 2. Backend (Django + DRF + PostgreSQL)

### 2.1 Cấu hình nền tảng

- **Database**: PostgreSQL thay cho SQLite trong [BE/config/settings.py](BE/config/settings.py).  
- **DRF + CORS**: thêm `djangorestframework`, `django-cors-headers`, cấu hình CORS cho origin React.  
- **.env**:
  - Tạo `.env` cho BE (chứa DB_NAME, DB_USER, DB_PASSWORD, SECRET_KEY, DEBUG, ALLOWED_HOSTS).  
  - Dùng `django-environ` hoặc tương tự để load.

### 2.2 Models chính (app `expenses`)

- **Category**:
  - Fields: user (FK), name, type (`INCOME`/`EXPENSE`), is_active.  
  - Unique: (user, name, type).
- **MonthlyReport**:
  - Fields: user (FK), year (int), month (int), title (optional), note (optional), timestamps.  
  - Unique: (user, year, month).
- **MonthlyCategoryBudget**:
  - Fields: user (FK), report (FK MonthlyReport), category (FK Category, chỉ cho type EXPENSE), planned_amount (Decimal).  
  - Unique: (user, report, category).
- **Transaction**:
  - Fields: user (FK), report (FK MonthlyReport), category (FK Category), amount (Decimal), date, description, created_at.  
  - Thu/chi suy ra từ `category.type` (không cần field type riêng).
- **QuickNote** (ghi chú nhanh):
  - Fields: user (FK), title (optional), content (text), is_favorite, created_at.  
  - Dùng để hiển thị trong popup ở FE.

### 2.3 API thiết kế

- **Auth**:
  - Đăng ký, đăng nhập (session hoặc JWT).
- **Category API**:
  - List/Create/Update/Delete.  
  - Filter theo type (income/expense).
- **MonthlyReport API**:
  - List/Create/Update/Delete report tháng của user.  
  - Endpoint chính cho flow vào tháng: ví dụ `/api/reports/`, `/api/reports/:id`.
- **Budget API (MonthlyCategoryBudget)**:
  - Endpoint để set/lấy budget theo report: ví dụ `/api/budgets/?report=12`.  
  - Trả về danh sách Category EXPENSE + budget tương ứng (0 nếu chưa set trong report đó).  
  - Hỗ trợ update nhiều dòng hoặc từng dòng.
- **Transaction API**:
  - List + filter theo `report`, `category`, và loại thu/chi (filter gián tiếp qua Category.type).  
  - Create/Update/Delete.
- **Stats API** (phase sau):
  - Làm sau khi flow report + budget + transactions ổn định.  
  - Có thể dùng endpoint dạng `/api/reports/:id/stats`.
- **QuickNote API**:
  - List/Create/Update/Delete notes của user hiện tại.

Tất cả API filter theo `request.user` (chỉ thấy data của mình).

### 2.4 Hỗ trợ i18n từ BE

- BE trả message dạng **code + optional default English**, ví dụ `{ "code": "LOGIN_FAILED", "message": "Login failed" }`.  
- **FE dựa vào `code` để hiển thị text đúng ngôn ngữ** (map trong `en.json`/`vi.json`), bỏ qua hoặc chỉ dùng `message` cho mục đích debug/log nếu cần.

---

## 3. Frontend (React + Vite + TS)

### 3.1 Cấu trúc i18n

- Tạo thư mục `src/i18n/` chứa:
  - `en.json`, `vi.json`: key-value các text.  
  - Một hook/Context đơn giản: `useI18n` với `t(key)` và state `language`.
- Tất cả text trong UI dùng `t('...')` thay vì hard-code.

### 3.2 Layout & Routing

- Dùng React Router:  
  - `/` (landing/giới thiệu)  
  - `/login`, `/register`  
  - `/dashboard` (placeholder tổng quan, sẽ refine sau)  
  - `/reports` (danh sách tháng)  
  - `/reports/:id` (chi tiết tháng: overview+budget, transactions, detailed report)  
  - `/categories`  
  - `/quick-notes`
- Layout chung: header (ngôn ngữ switch EN/VI, user menu), sidebar (menu các màn).

### 3.3 Màn chính

- **Auth pages**: Form login/register đơn giản, gọi API BE, lưu token/session.  
- **Landing page** (`/`):
  - Trang giới thiệu ngắn; chưa login hiện nút đăng nhập/đăng ký.
- **Dashboard** (`/dashboard`):
  - Placeholder cho thông tin "tình hình gần đây" (làm chi tiết sau).
- **Reports list** (`/reports`):
  - Danh sách report tháng của user; có nút tạo report tháng mới.
- **Report detail** (`/reports/:id`):
  - Tab 1: Overview + khu nhập/chỉnh budget của tháng đó.
  - Tab 2: Transactions của tháng đó (+ form nhập tay, có quick note popup cho description).
  - Tab 3: Detailed report + charts (làm sau).
- **Category management**:
  - Màn danh sách Category: filter theo type (thu/chi), thêm/sửa/xóa.
- **Quick Notes** (`/quick-notes` hoặc modal từ menu):
  - List các note (title + content).  
  - Thêm/sửa/xóa.  
  - Popup chọn note: khi click một note, FE chèn `content` vào description (thay hoặc thêm).

---

## 4. .env và cấu hình FE

- FE có `.env` riêng (ví dụ `.env.local`) để chứa `VITE_API_BASE_URL`.  
- FE dùng axios (hoặc fetch) với baseURL lấy từ `import.meta.env.VITE_API_BASE_URL`.

---

## 5. Thứ tự làm (MVP)

1. **BE**: .env + PostgreSQL + DRF + CORS.
2. **BE**: Model + API cho Category, MonthlyReport, MonthlyCategoryBudget, Transaction, QuickNote.
3. **BE**: Auth API.
4. **FE**: Layout + router + auth flow + landing page.
5. **FE**: Reports list + report detail (overview/budget + transactions tabs).
6. **FE**: Category screen + Quick Notes screen.
7. **FE**: Refine UI/UX + error handling chi tiết.
8. **FE/BE**: i18n chi tiết + stats/chart phase sau.

Sau khi xong MVP này, có thể bàn tiếp về import Excel, export CSV, đa tiền tệ, v.v.

