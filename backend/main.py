from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import search, library

app = FastAPI(title="OpusTag API", description="Backend for OpusTag Classical Music Manager")

# CORS config to allow frontend requests
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Vite default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(library.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "OpusTag Backend is running"}
