# Inventory Management System

Full-stack inventory tracking with a **React** frontend, **Python (FastAPI)** API, and **PostgreSQL** database.

## Features

- **Products** — CRUD with SKU, pricing, categories, and reorder levels
- **Stock movements** — Stock in, stock out, and quantity adjustments with history
- **Categories** — Organize products; filter and search on the products page
- **Dashboard** — Total units, inventory value, low-stock count, category breakdown, recent movements

## Prerequisites

- [Docker](https://www.docker.com/) (for PostgreSQL)
- Python 3.11+
- Node.js 18+

## Quick start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --app-dir .
```

API docs: http://127.0.0.1:8000/docs

Optional sample data:

```bash
python seed.py
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Project structure

```
inventory-management/
├── backend/          # FastAPI + SQLAlchemy
├── frontend/         # React + Vite + TypeScript
├── docker-compose.yml
└── README.md
```

## API overview

| Endpoint | Description |
|----------|-------------|
| `GET /api/reports/dashboard` | Summary metrics and recent activity |
| `GET/POST /api/categories` | List and create categories |
| `GET/POST/PATCH/DELETE /api/products` | Product CRUD |
| `POST /api/products/{id}/movements` | Record stock in/out/adjustment |
