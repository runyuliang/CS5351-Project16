# auth_service.py
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.role import Role
from ..core.security import hash_password, verify_password, create_access_token
from ..schemas.auth import UserCreate, UserUpdate
from datetime import timedelta

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    if not email:
        return None
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_in: UserCreate):
    try:
        existing_user = get_user_by_username(db, user_in.username)
        if existing_user:
            raise ValueError("用户名已存在")

        if user_in.email:
            existing_email = get_user_by_email(db, user_in.email)
            if existing_email:
                raise ValueError("邮箱已被使用")

        role = db.query(Role).filter(Role.name == user_in.role).first()
        if not role:
            role = Role(name=user_in.role, description=f"Auto-created role: {user_in.role}")
            db.add(role)
            db.flush()

        user = User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=hash_password(user_in.password),
            role_id=role.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise e

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create_user_token(user, expires_minutes: int = None):
    from ..core.config import settings
    delta = None
    if expires_minutes:
        delta = timedelta(minutes=expires_minutes)
    token = create_access_token(subject=str(user.id), expires_delta=delta)
    return token

def update_user_profile(db: Session, user_id: int, user_update: UserUpdate):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("用户不存在")

        if user_update.username and user_update.username != user.username:
            existing_user = get_user_by_username(db, user_update.username)
            if existing_user:
                raise ValueError("用户名已存在")

        if user_update.email and user_update.email != user.email:
            existing_email = get_user_by_email(db, user_update.email)
            if existing_email:
                raise ValueError("邮箱已被使用")

        if user_update.username is not None:
            user.username = user_update.username
        if user_update.email is not None:
            user.email = user_update.email
        if user_update.phone is not None:
            user.phone = user_update.phone
        if user_update.address is not None:
            user.address = user_update.address
        if user_update.bio is not None:
            user.bio = user_update.bio

        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise e