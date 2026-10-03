import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.routes import auth, societies, applications, admin

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------- CORS ----------------
# Extra exact origins can be set in FRONTEND_URL (comma-separated).
env_origins = [
    o.strip().rstrip("/")
    for o in settings.FRONTEND_URL.split(",")
    if o.strip()
]

allowed_origins = [
    "https://enlist-frontend.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    *env_origins,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # matches the production frontend and all its Vercel preview URLs
    allow_origin_regex=r"https://enlist-frontend.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["X-Access-Token", "Content-Disposition"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("SERVER ERROR:", repr(exc))
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "An internal server error occurred. Please try again later."},
    )


app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(societies.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}


@app.get("/")
def root():
    return {"status": "online", "message": "College Society Recruitment Platform API"}
