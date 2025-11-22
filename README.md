# Secure Password Storage Demo

Hệ thống web full-stack minh họa cách các thuật toán hash mật khẩu hiện đại (bcrypt, Argon2id) chống lại tấn công crack so với các thuật toán cũ (MD5/SHA1).

## Giới thiệu

Dự án này là một công cụ giáo dục giúp người dùng hiểu về:
- Sự khác biệt giữa các thuật toán hash mật khẩu (MD5, SHA1, bcrypt, Argon2id)
- Cách các thuật toán hiện đại bảo vệ mật khẩu tốt hơn
- Thời gian và tài nguyên cần thiết để crack mật khẩu với từng thuật toán
- Tầm quan trọng của việc sử dụng thuật toán hash an toàn

## Công nghệ sử dụng

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.2
- **Routing**: React Router DOM 7.9.6
- **HTTP Client**: Axios 1.13.2
- **Visualization**: Recharts 3.4.1
- **Styling**: CSS

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.1.0
- **Database**: PostgreSQL
- **Database Client**: pg 8.16.3
- **Hashing Libraries**: 
  - bcrypt 6.0.0
  - argon2 0.44.0
- **Security**: helmet 8.1.0, cors 2.8.5, express-rate-limit 8.2.1
- **Worker Threads**: Node.js built-in (cho cracking jobs)
- **Testing**: Jest 30.2.0, Supertest 7.1.4

### Database
- **PostgreSQL**: Lưu trữ thông tin người dùng và kết quả cracking jobs

## Cấu trúc thư mục dự án

```
password-demo/
├── backend/                      # Backend API server
│   ├── src/
│   │   ├── config/              # Cấu hình môi trường (.env)
│   │   ├── controllers/         # Controllers xử lý request
│   │   │   ├── authController.js    # Đăng ký, đăng nhập, quản lý user
│   │   │   └── crackController.js   # Quản lý cracking jobs
│   │   ├── database/            # Models và kết nối database
│   │   │   ├── db.js               # PostgreSQL connection pool
│   │   │   ├── userModel.js        # CRUD operations cho users
│   │   │   └── crackJobModel.js    # CRUD operations cho crack_jobs
│   │   ├── routes/              # API routes
│   │   │   ├── auth.js             # /api/auth/* endpoints
│   │   │   └── crack.js            # /api/crack/* endpoints
│   │   ├── services/            # Business logic
│   │   │   ├── crackingService.js  # Quản lý cracking jobs
│   │   │   ├── hashingService.js   # Hash và verify passwords
│   │   │   └── wordlistService.js  # Đọc wordlist files
│   │   ├── utils/               # Utility functions
│   │   │   ├── hashComparator.js   # So sánh hash
│   │   │   └── timeLogger.js       # Đo thời gian
│   │   ├── workers/             # Worker threads
│   │   │   └── crackWorker.js      # Thực thi cracking trong background
│   │   └── index.js             # Entry point
│   ├── wordlists/               # Dictionary files cho cracking
│   │   ├── small.txt               # 100 passwords phổ biến
│   │   ├── medium.txt              # 1,000 passwords
│   │   └── rockyou-mini.txt        # 10,000 passwords
│   ├── tests/                   # Unit tests
│   ├── scripts/                 # Utility scripts
│   ├── package.json
│   └── jest.config.js
│
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── AlgorithmSelector.jsx   # Chọn thuật toán hash
│   │   │   ├── CrackForm.jsx           # Form tạo cracking job
│   │   │   ├── CrackResultTable.jsx    # Hiển thị kết quả crack
│   │   │   ├── ProtectedRoute.jsx      # Route protection
│   │   │   ├── TimeChart.jsx           # Biểu đồ thời gian
│   │   │   └── UserTable.jsx           # Bảng danh sách users
│   │   ├── pages/               # Page components
│   │   │   ├── HomePage.jsx            # Trang chủ
│   │   │   ├── LoginPage.jsx           # Đăng nhập
│   │   │   ├── RegisterPage.jsx        # Đăng ký
│   │   │   ├── UserList.jsx            # Danh sách users
│   │   │   ├── CreateUserPage.jsx      # Tạo user mới
│   │   │   ├── CrackDemoPage.jsx       # Demo cracking
│   │   │   └── BenchmarkResults.jsx    # Kết quả benchmark
│   │   ├── services/            # API services
│   │   │   └── api.js                  # Axios API client
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── public/                  # Static assets
│   ├── package.json
│   └── vite.config.js
│
└── README.md                     # File này
```

## Hướng dẫn cài đặt & chạy chương trình

### Yêu cầu môi trường

- **Node.js**: >= 18.0.0 (khuyến nghị 20.x hoặc mới hơn)
- **npm**: >= 9.0.0
- **PostgreSQL**: >= 14.0
- **Hệ điều hành**: Windows, macOS, hoặc Linux

### Bước 1: Cài đặt PostgreSQL

1. Tải và cài đặt PostgreSQL từ: https://www.postgresql.org/download/
2. Trong quá trình cài đặt, ghi nhớ:
   - Username: `postgres` (mặc định)
   - Password: (bạn đặt)
   - Port: `5432` (mặc định) hoặc `5433`

### Bước 2: Tạo Database

Mở PostgreSQL command line (psql) hoặc pgAdmin và chạy:

```sql
CREATE DATABASE password_demo;
```

Hoặc sử dụng command line:

```bash
# Windows
psql -U postgres
CREATE DATABASE password_demo;
\q

# Linux/Mac
sudo -u postgres psql
CREATE DATABASE password_demo;
\q
```

### Bước 3: Cấu hình Backend

1. Di chuyển vào thư mục backend:
```bash
cd backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` trong thư mục `backend/`:
```bash
# Windows
copy NUL .env

# Linux/Mac
touch .env
```

4. Mở file `.env` và thêm cấu hình:
```env
# Port cho backend server
PORT=5000

# Kết nối PostgreSQL
# Định dạng: postgres://username:password@host:port/database
DATABASE_URL=postgres://postgres:password@localhost:5432/password_demo

# Thay đổi các giá trị sau cho phù hợp:
# - password: mật khẩu PostgreSQL của bạn
# - localhost: địa chỉ server (giữ nguyên nếu chạy local)
# - 5432: port PostgreSQL (đổi thành 5433 nếu bạn dùng port khác)
# - password_demo: tên database

# Cấu hình cracking (tùy chọn)
WORKER_TIMEOUT_MS=120000
MAX_CONCURRENT_JOBS=2
STARTUP_RETRY_DELAY_MS=5000
```

5. Khởi động backend:
```bash
# Development mode (tự động restart khi có thay đổi)
npm run dev

# Production mode
npm start
```

Backend sẽ chạy tại: `http://localhost:5000`

**Lưu ý**: Backend sẽ tự động tạo các bảng `users` và `crack_jobs` khi khởi động lần đầu.

### Bước 4: Cấu hình Frontend

1. Mở terminal mới, di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` trong thư mục `frontend/`:
```bash
# Windows
copy NUL .env

# Linux/Mac
touch .env
```

4. Mở file `.env` và thêm cấu hình:
```env
# URL của backend API
VITE_API_URL=http://localhost:5000/api
```

5. Khởi động frontend:
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### Bước 5: Truy cập ứng dụng

Mở trình duyệt và truy cập: `http://localhost:5173`

## Cấu trúc Database

### Bảng `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  hash TEXT NOT NULL,              -- Mật khẩu đã hash
  algorithm TEXT NOT NULL,         -- md5, sha1, bcrypt, argon2id
  salt TEXT,                       -- Salt (cho MD5/SHA1)
  params JSONB,                    -- Tham số thuật toán (cost, memory, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Bảng `crack_jobs`
```sql
CREATE TABLE crack_jobs (
  id UUID PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  attack_type TEXT NOT NULL,       -- dictionary hoặc brute-force
  wordlist TEXT,                   -- Tên file wordlist
  max_length INTEGER,              -- Độ dài tối đa (brute-force)
  charset TEXT,                    -- Bộ ký tự (brute-force)
  status TEXT NOT NULL,            -- pending, running, completed, failed
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  total_time_ms INTEGER,           -- Tổng thời gian (ms)
  attempts BIGINT DEFAULT 0,       -- Số lần thử
  attempts_per_sec DOUBLE PRECISION, -- Tốc độ thử/giây
  found_password TEXT              -- Mật khẩu tìm được (nếu có)
);
```

## Tài khoản demo

Hệ thống không có tài khoản mặc định. Bạn cần tạo tài khoản mới thông qua trang Register.

### Cách tạo tài khoản demo:

1. Truy cập: `http://localhost:5173/register`
2. Điền thông tin:
   - **Username**: admin
   - **Email**: admin@example.com
   - **Password**: Admin123!
   - **Algorithm**: Chọn một trong các thuật toán:
     - `md5` - Không an toàn, dễ crack
     - `sha1` - Không an toàn, dễ crack
     - `bcrypt` - An toàn, khó crack (Cost: 10-12)
     - `argon2id` - Rất an toàn, khó crack nhất
3. Click "Register"

### Gợi ý tài khoản để test:

**Tài khoản 1 - MD5 (dễ crack)**
- Username: `user_md5`
- Email: `md5@test.com`
- Password: `password123`
- Algorithm: `md5`

**Tài khoản 2 - bcrypt (khó crack)**
- Username: `user_bcrypt`
- Email: `bcrypt@test.com`
- Password: `password123`
- Algorithm: `bcrypt` (Cost: 10)

**Tài khoản 3 - Argon2id (rất khó crack)**
- Username: `user_argon2`
- Email: `argon2@test.com`
- Password: `password123`
- Algorithm: `argon2id`

## Hướng dẫn sử dụng

### 1. Đăng ký người dùng
- Truy cập trang Register
- Chọn thuật toán hash (MD5, SHA1, bcrypt, Argon2id)
- Nhập thông tin và mật khẩu
- Hệ thống sẽ hash mật khẩu và lưu vào database

### 2. Xem danh sách người dùng
- Truy cập "User List"
- Xem thông tin hash, salt, algorithm của từng user
- So sánh độ dài và độ phức tạp của các hash

### 3. Demo Cracking
- Chọn một user từ danh sách
- Chọn phương thức tấn công:
  - **Dictionary Attack**: Sử dụng wordlist có sẵn (small/medium/rockyou-mini)
  - **Brute Force**: Thử tất cả tổ hợp ký tự (giới hạn độ dài)
- Xem thời gian thực thi và kết quả

### 4. Xem Benchmark Results
- So sánh thời gian crack giữa các thuật toán
- Xem biểu đồ và thống kê
- Hiểu tại sao bcrypt/Argon2id an toàn hơn

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/users` - Lấy danh sách users
- `DELETE /api/auth/users/:id` - Xóa user

### Cracking
- `GET /api/crack/wordlists` - Lấy danh sách wordlists
- `POST /api/crack/jobs` - Tạo cracking job mới
- `GET /api/crack/jobs` - Lấy danh sách jobs
- `GET /api/crack/jobs/:id` - Lấy thông tin job
- `POST /api/crack/jobs/:id/cancel` - Hủy job
- `DELETE /api/crack/jobs/:id` - Xóa job
- `DELETE /api/crack/jobs` - Xóa tất cả jobs
- `GET /api/crack/stats` - Lấy thống kê benchmark

## Chạy Tests

```bash
cd backend
npm test
```

## Troubleshooting

### Lỗi kết nối Database
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Giải pháp**: 
- Kiểm tra PostgreSQL đã chạy chưa
- Kiểm tra port trong file `.env` (5432 hoặc 5433)
- Kiểm tra username/password trong `DATABASE_URL`

### Lỗi Port đã được sử dụng
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Giải pháp**:
- Đổi port trong file `backend/.env`: `PORT=5001`
- Hoặc tắt process đang dùng port 5000

### Frontend không kết nối được Backend
**Giải pháp**:
- Kiểm tra `VITE_API_URL` trong `frontend/.env`
- Đảm bảo backend đang chạy tại đúng port
- Kiểm tra CORS settings


