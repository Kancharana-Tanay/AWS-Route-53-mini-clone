from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.database import init_db
from app.routers import auth, hosted_zones, records


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "AWS Route 53-inspired DNS Management API. "
        "Provides hosted zone lifecycle management, DNS record provisioning, "
        "RFC-compliant validation for A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, and CAA records, "
        "and HTTP-only cookie-based mocked authentication."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(hosted_zones.router)
app.include_router(records.router)


@app.get(
    "/api/health",
    tags=["System"],
    summary="Health Check",
    description="Check backend API service status.",
)
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME, "version": "1.0.0"}


@app.get(
    "/",
    tags=["System"],
    summary="Root",
    description="Welcome endpoint directing to documentation.",
)
def root():
    return {
        "message": "Welcome to the AWS Route 53 Mini Clone API",
        "docs": "/docs",
        "health": "/api/health",
    }
