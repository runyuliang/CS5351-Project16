# user.py
from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..db.base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    phone = Column(String(20), nullable=True)  # 添加手机号字段
    address = Column(Text, nullable=True)      # 添加地址字段
    bio = Column(Text, nullable=True)          # 添加个人简介字段
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)

    role = relationship("Role")