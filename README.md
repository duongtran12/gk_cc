# Quản lý sách - 23IT042

Ứng dụng Node.js/Express minh họa phân quyền MongoDB Atlas và kiến trúc stateless.

## Luồng dữ liệu

- `GET /`: `bookService.listBooks()` chỉ dùng `MONGO_READ_URI`.
- `POST /books`: kiểm tra tiền tố `042`, tự tính VAT `8%`, rồi chỉ dùng `MONGO_WRITE_URI`.
- Session và flash message được lưu trong collection `sessions` trên Atlas qua `connect-mongo`; tiến trình Node không dùng `MemoryStore`.
- `GET /health`: endpoint kiểm tra tiến trình cho nền tảng PaaS.

## Quyền tối thiểu trên Atlas

Dùng hai database user theo đề:

1. `23IT042_read`: chỉ có quyền `find` trên `DB_23IT042.books`.
2. `23IT042_write`: có quyền `insert` trên `DB_23IT042.books`; đồng thời có quyền đọc/ghi/xóa và tạo TTL index trên `DB_23IT042.sessions` để `connect-mongo` vận hành.

`MONGO_SESSION_URI` có thể trỏ đến cùng user `23IT042_write`. Việc đọc dữ liệu nghiệp vụ vẫn chỉ đi qua user read; quyền đọc trên user write chỉ giới hạn ở collection hạ tầng `sessions`.

## Chạy cục bộ

1. Sao chép `.env.example` thành `.env` và điền URI Atlas thật.
2. Tạo `SESSION_SECRET` ngẫu nhiên dài tối thiểu 32 ký tự.
3. Chạy `npm install`, sau đó `npm test`.
4. Chạy `npm run preflight` để kiểm tra URI, quyền truy cập và TTL index của session.
5. Chạy `npm start`, sau đó mở `http://localhost:3000`.

Ở production, ứng dụng bật `trust proxy` và cookie `secure`; các URI/secret phải được cấu hình bằng biến môi trường của PaaS, không commit `.env`.

## Triển khai Render

File `render.yaml` khai báo Web Service, lệnh build/start và health check. Khi tạo Blueprint trên Render, nhập trực tiếp `MONGO_READ_URI`, `MONGO_WRITE_URI`, `MONGO_SESSION_URI` và `SESSION_SECRET` trong dashboard. Các biến nhạy cảm được đánh dấu `sync: false`, nên không được ghi vào Git.
