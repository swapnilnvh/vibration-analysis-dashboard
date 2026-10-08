import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from api.upload import router as upload_router
from api.analysis import router as analysis_router
from api.download import router as download_router
from services.file_parser import generate_sample_dataset

app = FastAPI(
    title="NVH Vibration Analysis Dashboard API",
    description="Laboratory Vibration Analysis API for LabVIEW Throughput Files (Time-domain, FFT, Spectrogram, Psychoacoustics)",
    version="1.0.0"
)

# CORS configuration allowing local dev, env-configured domains, and any Vercel deployment
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
custom_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

all_origins = list(set(default_origins + custom_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=all_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(upload_router)
app.include_router(analysis_router)
app.include_router(download_router)

@app.on_event("startup")
async def startup_event():
    # Pre-generate sample LabVIEW dataset so the system is ready for instant testing
    try:
        generate_sample_dataset()
        print("Default LabVIEW 6,400-sample NVH dataset pre-loaded successfully.")
    except Exception as e:
        print(f"Sample dataset initialization note: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "NVH Vibration Data Analysis API",
        "version": "1.0.0"
    }

# Production Static File Mounting for React Frontend
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.isdir(frontend_dist) and os.path.isfile(os.path.join(frontend_dist, "index.html")):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa_fallback(full_path: str):
        # Allow API and documentation routes to pass through
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        candidate = os.path.join(frontend_dist, full_path)
        if os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root_api_status():
        return {
            "status": "online",
            "service": "NVH Vibration Data Analysis API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/api/health"
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
