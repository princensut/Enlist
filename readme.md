# Enlist

A college society recruitment platform. Students register, browse societies and apply. Admins manage societies, review applicants and set application status. Login, roles, deadlines and duplicate checks are all enforced on the server.

Track B: 2nd Year Full-Stack Application.

## Contents

- [Features](#features)
- [How it works](#how-it-works)
- [Database design](#database-design)
- [Security](#security)
- [Setup](#setup)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)

## Features

### Students
- Register and log in with a hashed password
- Browse societies, filter by category and search by name
- See each society's deadline and whether it is open
- Submit an application and get a loading state, then a success or error message
- Track all of their applications (Pending, Accepted, Rejected) in one place

### Admins
- Create, view, update and delete societies
- View applicants per society, with search, filters and pagination handled in the database
- Update an applicant's status
- View analytics: applications per society, per category, and by status
- Every status change is written to an audit log

### Extras
| Feature | Description |
|---|---|
| Analytics | SQL aggregates (`COUNT`, `GROUP BY`); no hardcoded numbers |
| Rate limiting | Limits per IP/user on login, register and apply |
| Audit log | Records who changed which application, and when |
| Mock notifications | Submission and status-change events are logged as mock emails |
| CSV export | Admins can export applicant data; credentials are never included |

## How it works

```
React + Vite (Tailwind, React Router)
        |  REST API, HttpOnly session cookie
FastAPI (Pydantic v2, SlowAPI, Argon2)
        |  SQLAlchemy 2.x
MySQL 8 (indexes, foreign keys, unique constraints)
```

The frontend only improves usability. Hiding a button is not treated as security; every rule is checked again by the backend.

| Rule | How it is enforced |
|---|---|
| Authentication | JWT in an HttpOnly, SameSite=Lax cookie, verified on every request |
| Authorization | `require_role(...)` dependency: 401 if not logged in, 403 for the wrong role |
| Deadline | Server UTC time is compared with the society deadline on every application |
| Duplicate application | Service-level check plus `UNIQUE (user_id, society_id)` in MySQL |
| Input validation | Pydantic v2 on the server; client-side validation is for convenience only |

## Database design

```
users                  applications                societies
-----                  ------------                ---------
id (PK)           1:N  id (PK)                N:1  id (PK)
email (unique)         user_id (FK)                name
hashed_password        society_id (FK)             category (index)
full_name              status (index)              deadline (index)
role (enum)            submission_text             is_active
created_at             created_at (index)          created_at
                            |
                            | 1:N
                       audit_logs
                       ----------
                       id (PK)
                       application_id (FK)
                       action
                       performed_by (FK)
                       timestamp
```

- Students, applications and societies are separate tables linked by foreign keys.
- `UNIQUE KEY uq_user_society (user_id, society_id)` prevents duplicate applications at the database level, including under concurrent requests.
- B-Tree indexes on `societies(category)`, `societies(deadline)` and `applications(status, created_at)` support filtering and search.

## Security

| Area | Implementation | Location |
|---|---|---|
| Password hashing | Argon2id via `argon2-cffi` | `backend/app/core/security.py` |
| Sessions | JWT (PyJWT) in an HttpOnly cookie | `backend/app/core/security.py` |
| Route protection | `get_current_user` and `require_role` dependencies | `backend/app/core/dependencies.py` |
| Deadline check | Server UTC time vs. society deadline | `backend/app/services/application_service.py` |
| Search and filters | SQL `WHERE`, `LIKE`, `JOIN`, `LIMIT/OFFSET` | `backend/app/services/society_service.py` |
| Rate limiting | SlowAPI on sensitive endpoints | `backend/app/main.py` |
| Analytics | SQL aggregates | `backend/app/services/analytics_service.py` |
| Audit log and notifications | Written on submission and status change | `backend/app/services/admin_service.py` |

```python
# backend/app/core/dependencies.py
def require_role(allowed_roles: list[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Access denied: insufficient permissions.")
        return current_user
    return role_checker
```

A direct call to `/api/admin/*` (curl, Postman) without an admin cookie returns 401 or 403, regardless of what the UI shows.

## Setup

Requirements: Python 3.12+, Node.js 18+, MySQL 8.0+ on port 3306.

### 1. Create the database

```sql
CREATE DATABASE recruitment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Run the backend

```bash
cd recruitment-platform/backend

python3 -m venv .venv
source .venv/bin/activate          # Windows: .\.venv\Scripts\Activate.ps1

pip install --upgrade pip
pip install -r requirements.txt

cp .env.example .env               # then edit the values below
alembic upgrade head               # create tables
python scripts/seed_admin.py       # create the admin account
python scripts/seed_data.py        # add sample societies

uvicorn app.main:app --reload --port 5000
```

`backend/.env`:

```ini
DATABASE_URL=mysql+pymysql://root:<your_mysql_password>@localhost:3306/recruitment_db
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

| Service | URL |
|---|---|
| API | http://localhost:5000/api |
| Swagger docs | http://localhost:5000/docs |

### 3. Run the frontend

```bash
cd recruitment-platform/frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env
npm run dev
```

Open http://localhost:5173.

### Demo accounts (development only)

| Role | Email | Password | Access |
|---|---|---|---|
| Admin | `admin@college.edu` | `AdminSecurePassword123!` | Society CRUD, all applicants, analytics, status changes, CSV export |
| Student | `student@example.com` | `StudentPassword123!` | Browse societies, apply, view own applications |

Change these passwords and generate a new `SECRET_KEY` before any real deployment. Do not commit `.env`.

## Testing

```bash
cd recruitment-platform/backend
pytest -v
```

Tests run against an in-memory SQLite database, so local MySQL data is not affected.

| Test file | Verifies |
|---|---|
| `tests/test_auth.py` | Registration, password hashing, JWT creation, HttpOnly cookie |
| `tests/test_authorization.py` | Students get 403 on `/api/admin/*`; unauthenticated requests get 401 |
| `tests/test_deadlines.py` | Applying after the deadline returns 400, including via direct API calls |
| `tests/test_applications.py` | Status changes, duplicate rejection (409), students see only their own data |
| `tests/test_societies.py` | Society CRUD, category filter, search |

## Project structure

```
recruitment-platform/
  backend/
    app/
      api/routes/      applications.py, admin.py, ...
      core/            security.py, dependencies.py
      models/          SQLAlchemy models
      services/        deadline, search, analytics and audit logic
      main.py          app setup, CORS, rate limiting
    alembic/           migrations
    scripts/           seed_admin.py, seed_data.py
    tests/
  frontend/
    src/
      components/      toasts, loaders, shared UI
      pages/
      services/        fetch wrapper that sends credentials
```

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, React Router v6, Tailwind CSS, native `fetch` |
| Backend | FastAPI, Uvicorn, Pydantic v2, SlowAPI |
| Auth | Argon2id (`argon2-cffi`), PyJWT, HttpOnly cookies |
| Database | MySQL 8, SQLAlchemy 2.x, PyMySQL, Alembic |
| Testing | pytest, httpx |

## User feedback in the interface

- A loading indicator is shown for every request.
- Success and error messages appear as toasts in plain language; raw server errors are never shown.
- Buttons are disabled while a request is running to prevent double submissions.
- Empty lists show a short message, for example when a society has no applicants.#   T r a v e l M a t e  
 