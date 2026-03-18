---
name: Plan dự án quản lý tài chính (bản chi tiết hơn)
overview: "Plan cập nhật cho ứng dụng quản lý tài chính: thêm Category dùng chung theo tháng, budget theo từng Category/tháng, ghi chú nhanh cho description, i18n Anh/Việt với en.json/vi.json, và MVP nhập giao dịch bằng nút + (không Excel)."
todos: []
isProject: false
---

# Plan dự án quản lý tài chính (bản chi tiết hơn)

## 1. Chốt yêu cầu nghiệp vụ

- **User & Auth**: mỗi user có tài khoản riêng, chỉ thấy dữ liệu của mình.  
- **Category tổng**:
  - Có 2 nhóm: **Category thu** và **Category chi**.  
  - **Mỗi user tự định nghĩa bộ Category riêng** (per user), không dùng chung.
- **Budget theo Category/tháng**:
  - Mỗi tháng, cho **mỗi Category chi**, user có thể nhập `planned_amount` (dự định chi).  
  - Thực chi = tổng `amount` của Transaction thuộc Category đó trong tháng đó.  
  - Thống kê tháng: với mỗi Category chi: `planned` vs `actual`; có thể có tổng toàn tháng (sum tất cả Category chi).
- **Transaction**:
  - Field chính: date, description (note chính), amount, category, created_at.  
  - **Không còn field type** trên Transaction; thu/chi được suy ra từ `category.type`.  
  - Category bắt buộc, và Category đã biết trước (chọn từ list).
- **Nhập giao dịch (MVP)**:
  - Nhập **bằng nút +** (form tay) là chính.  
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
- **MonthlyCategoryBudget**:
  - Fields: user (FK), category (FK Category, chỉ cho type EXPENSE), year (int), month (int), planned_amount (Decimal).  
  - Unique: (user, category, year, month).
- **Transaction**:
  - Fields: user (FK), category (FK Category), amount (Decimal), date, description, created_at.  
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
- **Budget API (MonthlyCategoryBudget)**:
  - Endpoint để set/lấy budget theo năm-tháng: ví dụ `/api/budgets/?year=2026&month=3`.  
  - Trả về danh sách Category EXPENSE + budget tương ứng (0 nếu chưa set).  
  - Hỗ trợ update nhiều dòng hoặc từng dòng.
- **Transaction API**:
  - List + filter theo `year`, `month`, `category`, và loại thu/chi (filter gián tiếp qua Category.type).  
  - Create/Update/Delete.
- **Stats API**:
  - Ví dụ `/api/stats/monthly/?year=2026&month=3`.  
  - Trả về:  
    - Theo từng Category EXPENSE: `planned`, `actual`, `diff`.  
    - Tổng toàn tháng: tổng thu, tổng chi, tổng planned, tổng actual, chênh lệch.
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
  - `/login`, `/register`  
  - `/dashboard`  
  - `/transactions`  
  - `/budgets` (dự kiến chi)  
  - `/stats`  
  - `/quick-notes` (hoặc gộp vào một tab của settings).
- Layout chung: header (ngôn ngữ switch EN/VI, user menu), sidebar (menu các màn).

### 3.3 Màn chính

- **Auth pages**: Form login/register đơn giản, gọi API BE, lưu token/session.  
- **Category management**:
  - Màn danh sách Category: filter theo type (thu/chi), thêm/sửa/xóa.
- **Budget per Category per Month** (`/budgets`):
  - Chọn `year`, `month`.  
  - Bảng: mỗi dòng là một Category EXPENSE, có input `planned_amount`.  
  - Nút Save để gửi cả bảng lên BE.
- **Transactions** (`/transactions`):
  - Filter theo `year`, `month`, loại (thu/chi) và category (dựa trên Category.type).  
  - UI tách rõ 2 khối/cột: một khối cho **Thu** (chỉ Category thu), một khối cho **Chi** (chỉ Category chi).  
  - Bảng list giao dịch.  
  - Nút `+` ở mỗi khối mở form:
    - Chọn category (list theo khối Thu/Chi), date, amount, description (note chính).  
    - Ở phần description có **icon nhỏ** (ví dụ `📝` hoặc chữ `N`) -> mở popup Quick notes để chọn note mẫu, dán vào description.
- **Quick Notes** (`/quick-notes` hoặc modal từ menu):
  - List các note (title + content).  
  - Thêm/sửa/xóa.  
  - Popup chọn note: khi click một note, FE chèn `content` vào description (thay hoặc thêm).
- **Stats** (`/stats`):
  - Chọn `year`, `month`.  
  - Hiển thị:  
    - Bảng Category: `planned`, `actual`, `diff`.  
    - Tổng thu, tổng chi, tổng planned, tổng actual, diff.
  - Có thể thêm 1 biểu đồ đơn giản sau.

---

## 4. .env và cấu hình FE

- FE có `.env` riêng (ví dụ `.env.local`) để chứa `VITE_API_BASE_URL`.  
- FE dùng axios (hoặc fetch) với baseURL lấy từ `import.meta.env.VITE_API_BASE_URL`.

---

## 5. Thứ tự làm (MVP)

1. **BE**: .env + PostgreSQL + DRF + CORS.
2. **BE**: Model + API cho Category, Transaction, MonthlyCategoryBudget, QuickNote, Stats.
3. **BE**: Auth API.
4. **FE**: Thiết lập i18n (en.json/vi.json), layout + router, auth flow.
5. **FE**: Category screen + Budget screen.
6. **FE**: Transactions screen với popup Quick note trong description.
7. **FE**: Stats screen.
8. **Refine UI/UX, error handling, i18n chi tiết hơn.

Sau khi xong MVP này, có thể bàn tiếp về import Excel, export CSV, đa tiền tệ, v.v.

