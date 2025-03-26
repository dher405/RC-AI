from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, rc, customers
from fastapi.middleware.cors import CORSMiddleware
from app.api import ai

# ⬇️ Import routers after FastAPI instance is created
from app.api import auth, rc

app = FastAPI()

# ⬇️ Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ⬇️ Mount routes
app.include_router(auth.router)
app.include_router(rc.router)
app.include_router(customers.router)
app.include_router(ai.router)
