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


# ============================================================
# CORS
# ============================================================

ALLOWED_ORIGINS = [
    "https://enlist-frontend.vercel.app",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Global Exception Handler
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"ERROR: {exc}")

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An internal server error occurred. Please try again later.",
        },
    )


# ============================================================
# API Routes
# ============================================================

app.include_router(
    auth.router,
    prefix=settings.API_V1_STR,
)

app.include_router(
    societies.router,
    prefix=settings.API_V1_STR,
)

app.include_router(
    applications.router,
    prefix=settings.API_V1_STR,
)

app.include_router(
    admin.router,
    prefix=settings.API_V1_STR,
)


# ============================================================
# Health Check
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
    }