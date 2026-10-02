# Enlist — College Society Recruitment Platform

[![Live App](https://img.shields.io/badge/Live_Demo-Enlist-brightgreen?style=for-the-badge&logo=vercel)](https://enlist-frontend-git-main-princekumar1821006-7883s-projects.vercel.app/)
[![Track](https://img.shields.io/badge/Track-Track_B:_2nd_Year_Full--Stack-blue?style=for-the-badge)](#)

> A centralized platform for managing student recruitment into college societies. Built with **React 18**, **FastAPI**, and **MySQL 8**.

---

## 📌 Table of Contents
- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Security & Business Rules](#-security--business-rules)
- [Database Schema](#-database-schema)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Setup](#-local-setup)
- [Testing](#-testing)
- [Demo Credentials](#-demo-credentials)

---

## 📋 Overview

**Enlist** streamlines the entire onboarding process for college societies. Students can discover societies, check application deadlines, and track their application statuses in real time. Admins can create listings, manage applicants with server-side pagination/filtering, review dynamic analytics, and output reports with full audit logging.

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│           Frontend: React 18 + Vite + Tailwind               │
└──────────────────────────────┬───────────────────────────────┘
                               │ REST API (HttpOnly Credentials)
┌──────────────────────────────▼───────────────────────────────┐
│     Backend: FastAPI (Pydantic v2, Argon2id, SlowAPI)        │
└──────────────────────────────┬───────────────────────────────┘
                               │ SQLAlchemy 2.x
┌──────────────────────────────▼───────────────────────────────┐
│ Database: MySQL 8 (B-Tree Indexes, Unique Constraints, FKs) │
└──────────────────────────────────────────────────────────────┘
```

The frontend strictly serves to enhance user experience. All validation, role authorization, and deadline checks are strictly enforced on the server.

---

## ✨ Key Features

### 🎓 Students
- **Secure Authentication:** Register and log in using Argon2id password hashing and HttpOnly session cookies.
- **Society Discovery:** Search societies by name, filter by category, and view real-time countdown deadlines.
- **Application Portal:** Direct application submission with feedback states (loading, success, error toast notifications).
- **Dashboard:** Unified view tracking all submitted applications and their live status (*Pending*, *Accepted*, *Rejected*).

### 🛠 Admins
- **Society Management:** Full CRUD (Create, Read, Update, Delete) support for college societies.
- **Applicant Directory:** Search, filter, and paginate through applicants directly within database queries.
- **Status Workflows:** Review applications, update status flags, and automatically dispatch mock notification emails.
- **Analytics Hub:** Real-time metrics powered by native SQL aggregates (`COUNT`, `GROUP BY`) showing applications by category, society, and status.
- **Audit Logging & CSV Export:** Immutable audit log tracking every status change, alongside one-click applicant CSV export (sensitive credentials omitted).

---

## 🔒 Security & Business Rules

| Security Aspect | Implementation Details | Location |
| :--- | :--- | :--- |
| **Password Hashing** | Argon2id hashing via `argon2-cffi` | `backend/app/core/security.py` |
| **Authentication** | PyJWT with HttpOnly, `SameSite=Lax` cookies | `backend/app/core/security.py` |
| **Authorization** | `require_role(...)` dependency guard (401/403 HTTP codes) | `backend/app/core/dependencies.py` |
| **Deadline Guard** | Server UTC time compared with database deadline on every submit | `backend/app/services/application_service.py` |
| **Duplicate Prevention** | Service check combined with `UNIQUE (user_id, society_id)` constraint | Database & Service Layer |
| **Rate Limiting** | SlowAPI limits applied to `/login`, `/register`, and `/apply` | `backend/app/main.py` |

```python
# backend/app/core/dependencies.py
def require_role(allowed_roles: list[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403, 
                detail="Access denied: insufficient permissions."
            )
        return current_user
    return role_checker
```

---

## 🗄 Database Schema

```
  ┌──────────────────┐         ┌──────────────────────┐         ┌──────────────────┐
  │      users       │         │     applications     │         │    societies     │
  ├──────────────────┤         ├──────────────────────┤         ├──────────────────┤
  │ id (PK)          │ 1    N  │ id (PK)              │ N    1  │ id (PK)          │
  │ email (UNIQUE)   ├─────────┤ user_id (FK)         ├─────────┤ name             │
  │ hashed_password  │         │ society_id (FK)      │         │ category (INDEX) │
  │ full_name        │         │ status (INDEX)       │         │ deadline (INDEX) │
  │ role (ENUM)      │         │ submission_text      │         │ is_active        │
  │ created_at       │         │ created_at (INDEX)   │         │ created_at       │
  └──────────────────┘         └──────────┬───────────┘         └──────────────────┘
                                          │ 1
                                          │
                                          │ N
                               ┌──────────┴───────────┐
                               │      audit_logs      │
                               ├──────────────────────┤
                               │ id (PK)              │
                               │ application_id (FK)  │
                               │ action               │
                               │ performed_by (FK)    │
                               │ timestamp            │
                               └──────────────────────┘
```

- **Unique Constraint:** `uq_user_society (user_id, society_id)` prevents duplicate applications even during concurrent requests.
- **Indexes:** B-Tree indexes on `societies(category, deadline)` and `applications(status, created_at)` optimize query performance.

---

## 💻 Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Tailwind CSS
- **Backend:** FastAPI, Uvicorn, Pydantic v2, SlowAPI
- **Database & ORM:** MySQL 8, SQLAlchemy 2.x, Alembic, PyMySQL
- **Authentication:** Argon2id (`argon2-cffi`), PyJWT, HttpOnly Cookies
- **Testing:** Pytest, HTTPX, SQLite (In-Memory)

---

## 📂 Project Structure

```
recruitment-platform/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # Endpoint handlers (auth, admin, applications, societies)
│   │   ├── core/            # Security configs, JWT handler, dependencies
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── services/        # Business logic, deadline checks, audit logs, analytics
│   │   └── main.py          # FastAPI application entrypoint & middleware
│   ├── alembic/             # Database migration scripts
│   ├── scripts/             # Admin initialization & mock data seeders
│   └── tests/               # Pytest suite
└── frontend/
    └── src/
        ├── components/      # Reusable UI components (Toasts, Modals, Spinners)
        ├── pages/           # Page routes (Student/Admin dashboards, Society lists)
        └── services/        # Fetch wrapper with auto-included credentials
```

---

## 🚀 Local Setup

### Prerequisites
- **Python** 3.12+
- **Node.js** 18+
- **MySQL** 8.0+ running on port `3306`

### 1. Database Setup
```sql
CREATE DATABASE recruitment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup
```bash
cd recruitment-platform/backend

# Create & activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\Activate.ps1

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Configure Environment
cp .env.example .env
# Edit .env file with your database credentials

# Run database migrations and seed data
alembic upgrade head
python scripts/seed_admin.py
python scripts/seed_data.py

# Start local server
uvicorn app.main:app --reload --port 5000
```
- **API URL:** `http://localhost:5000/api`
- **Swagger Docs:** `http://localhost:5000/docs`

### 3. Frontend Setup
```bash
cd recruitment-platform/frontend

# Install dependencies
npm install

# Configure local API URL
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env

# Run development client
npm run dev
```
- **App URL:** `http://localhost:5173`

---

## 🧪 Testing

Backend tests execute using an isolated **in-memory SQLite database** to ensure local database records remain untouched.

```bash
cd recruitment-platform/backend
pytest -v
```

| Test File | Verified Functionality |
| :--- | :--- |
| `tests/test_auth.py` | Registration, Argon2 password hashing, JWT cookie generation |
| `tests/test_authorization.py` | Route protection, student role blocks (`403`), unauthenticated checks (`401`) |
| `tests/test_deadlines.py` | Expiration verification blocking late applications (`400`) |
| `tests/test_applications.py` | Status state transitions, duplicate prevention (`409`), data scoping |
| `tests/test_societies.py` | Society CRUD operations, search, and category filter logic |

---

## 🔑 Demo Credentials

> **Note:** Development/testing credentials only. Ensure environment variables and secret keys are replaced prior to deployment.

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `AdminSecurePassword123!` | Full CRUD, Applicant Review, Status Overrides, Analytics, CSV Export |
| **Student** | `student@example.com` | `StudentPassword123!` | Browse Societies, Apply, View Application Status Dashboard |