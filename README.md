# Secure Password Storage Demo

Full-stack web lab that demonstrates how modern password hashing algorithms (bcrypt, Argon2id) resist cracking compared to legacy MD5/SHA1.

## Stack

- **Frontend**: React + Vite, Recharts for visualization
- **Backend**: Node.js + Express, worker threads for cracking jobs
- **Database**: PostgreSQL for users + cracking jobs

## Features

- Register users with selectable algorithms and parameters (cost factor, memory/time cost, optional salt for MD5/SHA1).
- Login demo that verifies passwords with the original algorithm.
- User table showing raw hashes, salt, parameters, timestamp.
- Cracking lab: dictionary or limited brute-force attacks executed inside worker threads with metrics (attempts, total time, throughput, found password).
- Benchmark dashboard with bar + donut charts and aggregated statistics.

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env   # set DATABASE_URL if needed
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL if backend differs
npm install
npm run dev
```

Visit `http://localhost:5173` (default Vite dev server). Ensure PostgreSQL is running and accessible via `DATABASE_URL`.

## Project Structure

```
backend/
  src/routes, controllers, services, workers, database, utils
  wordlists/ (100 / 1k / 10k entries)
frontend/
  src/pages, components, services
```

## Next Steps

- Harden API (auth, rate limit) for production use.
- Add automated tests and CI workflows.
- Extend cracking engine with GPU/offline benchmarks or additional algorithms.


