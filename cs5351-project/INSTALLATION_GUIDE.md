

# CityU ProjectHub - 安装指南

## 系统要求
- Windows/Mac/Linux
- Conda (Miniconda 或 Anaconda)
- Node.js 16+

---


## 🌐 前端环境设置

```bash
# 进入前端目录
cd frontend

# 安装 Node.js 依赖
npm install
```

## 🌐 后端环境设置

```bash
cd backend

# 安装 Python 依赖
pip install -r requirements.txt
```

## 🚀 启动项目

### 启动前端服务

```bash
cd frontend

npm run dev
```



### 启动后端服务

```bash
cd backend

uvicorn app.main:app --reload --port 8000
```

---

## 📊 功能特性

### 已实现功能

- ✅ 用户注册
- ✅ 用户登录
- ✅ JWT 认证
- ✅ 个人信息管理
- ✅ 密码修改
- ✅ 响应式界面
- ✅ 看板基础布局

### 待开发功能

- 🔄 项目管理 CRUD
- 🔄 任务管理
- 🔄 团队协作
- 🔄 文件上传
- 🔄 实时通知

## 🔧 开发指南

### API 开发

1. 在 `backend/app/schemas/` 中添加 Pydantic 模型
2. 在 `backend/app/models/` 中添加 SQLAlchemy 模型
3. 在 `backend/app/api/v1/` 中添加路由
4. 在 `backend/app/services/` 中添加业务逻辑

### 前端开发

1. 在 `frontend/src/components/` 中添加组件
2. 在 `frontend/src/pages/` 中添加页面
3. 在 `frontend/src/api/` 中添加 API 调用

