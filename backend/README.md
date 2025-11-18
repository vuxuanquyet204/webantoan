# Secure Password Storage Backend

Node.js + Express backend that demonstrates secure password storage and hash cracking benchmarks (bcrypt/argon2id vs MD5/SHA1).

## Getting Started

1. Copy `.env.example` to `.env` and set `DATABASE_URL` for PostgreSQL.
2. Install dependencies: `npm install`
3. Run migrations + dev server: `npm run dev`

The server automatically creates tables (`users`, `crack_jobs`) on startup.

## REST Endpoints

- `POST /api/auth/register` – register user with selected hash algorithm
- `POST /api/auth/login` – verify credentials against stored hash
- `GET /api/auth/users` – list stored hashes
- `GET /api/crack/wordlists` – available wordlists
- `POST /api/crack/jobs` – create cracking job (dictionary or brute-force)
- `GET /api/crack/jobs` – list jobs
- `GET /api/crack/jobs/:id` – job status
- `GET /api/crack/stats` – aggregated benchmark metrics

## Wordlists

Pre-generated fixture files live under `wordlists/`:

| File | Lines | Notes |
| ---- | ----- | ----- |
| `small.txt` | 100 | quick demo |
| `medium.txt` | 1,000 | classroom exercise |
| `rockyou-mini.txt` | 10,000 | stress test |

Use `node scripts/generateWordlists.js` to regenerate them.


