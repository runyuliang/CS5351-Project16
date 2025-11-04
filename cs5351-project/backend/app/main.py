from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1 import auth as auth_router
from .db.base import Base
from .db.session import engine

# create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="simple-jira-backend")

# 更新 CORS 配置 - 添加所有可能的端口
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # React 默认端口
        "http://127.0.0.1:3000",      # React 本地地址
        "http://localhost:5173",      # Vite 默认端口
        "http://127.0.0.1:5173",      # Vite 本地地址
        "http://localhost:8080",      # 其他可能的前端端口
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)

@app.get("/")
def root():
    return {"msg": "simple-jira backend running"}