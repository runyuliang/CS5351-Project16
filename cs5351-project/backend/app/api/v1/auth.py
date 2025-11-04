# auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ...db.session import SessionLocal
from ...schemas.auth import UserCreate, UserLogin, Token, UserRead, UserUpdate
from ...services.auth_service import (
    create_user,
    authenticate_user,
    create_user_token,
    get_user_by_username,
    update_user_profile
)
from ...core.security import decode_access_token
from ...models.user import User

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
):
    try:
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="无效的token")

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="无效的token")

        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=401, detail="用户不存在")

        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="认证失败")


@router.post("/register", response_model=UserRead)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        existed = get_user_by_username(db, user_in.username)
        if existed:
            raise HTTPException(status_code=400, detail="用户名已存在")
        user = create_user(db, user_in)

        return UserRead(
            id=user.id,
            username=user.username,
            email=user.email,
            phone=user.phone,
            address=user.address,
            bio=user.bio,
            role=user.role.name if user.role else None
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"注册错误: {e}")
        raise HTTPException(status_code=500, detail=f"注册失败: {str(e)}")


@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    try:
        user = authenticate_user(db, user_in.username, user_in.password)
        if not user:
            raise HTTPException(status_code=401, detail="用户名或密码错误")
        token = create_user_token(user)
        return {"access_token": token, "token_type": "bearer"}
    except Exception as e:
        print(f"登录错误: {e}")
        raise HTTPException(status_code=500, detail=f"登录失败: {str(e)}")


@router.get("/me", response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserRead(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        phone=current_user.phone,
        address=current_user.address,
        bio=current_user.bio,
        role=current_user.role.name if current_user.role else None
    )


@router.put("/profile", response_model=UserRead)
def update_user_info(
        user_update: UserUpdate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    try:
        updated_user = update_user_profile(db, current_user.id, user_update)

        return UserRead(
            id=updated_user.id,
            username=updated_user.username,
            email=updated_user.email,
            phone=updated_user.phone,
            address=updated_user.address,
            bio=updated_user.bio,
            role=updated_user.role.name if updated_user.role else None
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"更新用户信息错误: {e}")
        raise HTTPException(status_code=500, detail=f"更新失败: {str(e)}")