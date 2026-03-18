# Gợi ý kiến trúc Frontend (React + Vite + TypeScript)

Dùng cho app quản lý tài chính: auth, categories, budgets, transactions, quick notes, stats. FE gọi API BE, dùng i18n (en/vi).

---

## 1. Cấu trúc thư mục đề xuất

```
Frontend/
├── public/
├── src/
│   ├── api/              # Gọi BE
│   │   ├── client.ts      # Axios instance (baseURL, token)
│   │   ├── account.ts     # login, register
│   │   ├── categories.ts
│   │   ├── transactions.ts
│   │   ├── budgets.ts
│   │   ├── quickNotes.ts
│   │   └── stats.ts
│   │
│   ├── components/        # Component dùng chung
│   │   ├── ui/            # Button, Input, Modal, Table...
│   │   ├── layout/        # Header, Sidebar, MainLayout
│   │   └── common/        # Loading, ErrorMessage, ConfirmDialog
│   │
│   ├── pages/         # Theo từng tính năng (recommend)
│   │   ├── auth/
│   │   │   ├── components/   # LoginForm, RegisterForm
│   │   │   ├── hooks/       # useAuth (user, login, logout)
│   │   │   └── pages/       # LoginPage, RegisterPage
│   │   ├── dashboard/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── transactions/
│   │   ├── quick-notes/
│   │   └── stats/
│   │
│   ├── i18n/
│   │   ├── en.json
│   │   ├── vi.json
│   │   └── index.ts       # useI18n, t(key), setLanguage
│   │
│   ├── routes/
│   │   └── index.tsx      # React Router: /login, /register, /dashboard, ...
│   │
│   ├── types/             # TypeScript types (theo response BE)
│   │   ├── api.ts
│   │   ├── category.ts
│   │   ├── transaction.ts
│   │   └── ...
│   │
│   ├── App.tsx
│   └── main.tsx
├── .env.local             # VITE_API_BASE_URL
├── index.html
├── package.json
└── vite.config.ts
```

**Ý tưởng:** Mỗi **feature** (auth, categories, transactions...) gom components + hooks + pages của màn đó; **api/** tách theo resource để dễ tìm và mock; **i18n** và **routes** tách riêng để đổi ngôn ngữ / bảo vệ route đơn giản.

---

## 2. Luồng auth & bảo vệ route

- **Token:** BE trả `token` khi login/register; FE lưu (localStorage hoặc cookie) và gửi header `Authorization: Token <token>` mỗi request.
- **Axios:** Trong `api/client.ts` set `baseURL = import.meta.env.VITE_API_BASE_URL`, intercept request để gắn token, intercept response 401 để logout + redirect login.
- **Route:** Có route công khai (`/login`, `/register`) và route cần đăng nhập (`/dashboard`, `/transactions`, ...). Dùng component bảo vệ (ví dụ `ProtectedRoute`) kiểm tra “đã có user chưa” (từ context/store), chưa thì redirect về `/login`.

---

## 3. State: nên dùng gì?

- **Auth (user, token):** Context (React Context) hoặc Zustand là đủ.
- **Danh sách categories, transactions, budgets:** Có thể **chỉ fetch khi vào màn** (useEffect + useState) rồi refetch sau khi thêm/sửa/xóa; không bắt buộc Redux trừ khi app mở rộng nhiều màn dùng chung data phức tạp.
- **i18n (ngôn ngữ):** Context nhỏ (language + setLanguage) + file `en.json` / `vi.json`; dùng `t('key')` cho mọi chữ hiển thị.

---

## 4. Làm view trước (theo ý bạn)

- Ưu tiên **layout chung:** MainLayout (header, sidebar, outlet), route `/dashboard`, `/transactions`, `/budgets`, `/stats`, `/quick-notes`.
- Mỗi màn có thể tạm **chưa gọi API:** chỉ layout + title + vài component giả (placeholder bảng, form). Sau đó từng bước:
  1. Bật **auth** (login/register + token + ProtectedRoute).
  2. Lần lượt nối **categories** → **transactions** → **budgets** → **quick-notes** → **stats** với BE.

---

## 5. Lỗi / i18n từ BE

- BE trả `{ "code": "LOGIN_FAILED", "message": "..." }`. FE dùng `code` để map sang key trong `en.json` / `vi.json` (ví dụ `errors.LOGIN_FAILED`), còn `message` dùng cho log/debug nếu cần.

Nếu bạn muốn, bước tiếp có thể là: tạo repo Vite + React + TS, cấu trúc thư mục như trên, rồi làm từng màn layout + auth trước.
