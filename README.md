# Inventory Management System

A portfolio project for tracking products, categories, stock levels, and inventory movements.

This project is designed to demonstrate full-stack application thinking: database-driven inventory records, CRUD operations, dashboard metrics, and clear API structure.

## Features

- Product management with SKU, price, category, and reorder level fields
- Stock in, stock out, and quantity adjustment history
- Category organization with filtering and search
- Dashboard overview for total units, inventory value, low-stock items, and recent activity
- API-first structure prepared for frontend integration

## Tech Stack

- Frontend: React, Vite, TypeScript
- Backend: Python, FastAPI
- Database: PostgreSQL
- Tools: Docker, Git, GitHub

## Project Structure

```text
inventory-management/
├── backend/          # FastAPI API and database models
├── frontend/         # React + Vite frontend
├── docker-compose.yml
└── README.md
```

## API Overview

| Endpoint | Description |
|---|---|
| `GET /api/reports/dashboard` | Dashboard metrics and recent activity |
| `GET /api/categories` | List categories |
| `POST /api/categories` | Create a category |
| `GET /api/products` | List products |
| `POST /api/products` | Create a product |
| `PATCH /api/products/{id}` | Update a product |
| `DELETE /api/products/{id}` | Delete a product |
| `POST /api/products/{id}/movements` | Record stock movement |

## Why I Built This

Inventory systems are common business tools. I built this project to practice building a realistic full-stack application with structured data, backend APIs, and a user-friendly interface.

## Next Improvements

- Add authentication and user roles
- Add CSV import/export
- Add charts for inventory trends
- Deploy frontend and backend
- Add screenshots and a live demo link
