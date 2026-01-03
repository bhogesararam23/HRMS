"""
SQLAlchemy Models for HRMS Backend
"""
from sqlalchemy import Column, Integer, String, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    EMPLOYEE = "employee"


class LeaveStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class User(Base):
    """User model for authentication and employee management"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.EMPLOYEE.value)
    department = Column(String(100), default="General")
    position = Column(String(100), default="Staff")
    phone = Column(String(20), nullable=True)
    base_salary = Column(Integer, default=50000)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    attendances = relationship("Attendance", back_populates="user")
    leaves = relationship("Leave", back_populates="user", foreign_keys="Leave.user_id")


class Attendance(Base):
    """Attendance records for employees"""
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    status = Column(String(50), default="Present")  # Present, Absent, Late, Half-day
    in_time = Column(Time, nullable=True)
    out_time = Column(Time, nullable=True)
    work_hours = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="attendances")


class Leave(Base):
    """Leave requests from employees"""
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(String(500), nullable=False)
    leave_type = Column(String(50), default="Annual")  # Annual, Sick, Personal, etc.
    status = Column(String(50), default=LeaveStatus.PENDING.value)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(Integer, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="leaves", foreign_keys=[user_id])


class Holiday(Base):
    """Company holidays"""
    __tablename__ = "holidays"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    date = Column(Date, nullable=False, unique=True)
    description = Column(String(500), nullable=True)
