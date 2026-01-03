"""
HRMS Backend - FastAPI Application
High-performance Python backend with Hybrid Database (Postgres/SQLite)
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, date, time, timedelta
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from passlib.context import CryptContext
import logging

# New imports
from database import get_db, engine, Base, SessionLocal
from models import User, Attendance, Leave, Holiday, UserRole, LeaveStatus

# ============================================================
# Configuration
# ============================================================

SECRET_KEY = "hrms-super-secret-key-change-in-production-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================
# Pydantic Schemas
# ============================================================

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    name: str
    email: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "employee"
    department: Optional[str] = "General"
    position: Optional[str] = "Staff"

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    department: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    base_salary: Optional[float] = 50000.0
    
    class Config:
        from_attributes = True

class EmployeeCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    department: Optional[str] = "General"
    position: Optional[str] = "Staff"
    phone: Optional[str] = None

class AttendanceResponse(BaseModel):
    id: int
    date: date
    status: str
    in_time: Optional[time]
    out_time: Optional[time]
    work_hours: Optional[str]
    
    class Config:
        from_attributes = True

class LeaveCreate(BaseModel):
    start_date: date
    end_date: date
    reason: str
    leave_type: Optional[str] = "Annual"

class LeaveResponse(BaseModel):
    id: int
    start_date: date
    end_date: date
    reason: str
    leave_type: str
    status: str
    applied_at: datetime
    user_id: int
    user_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class LeaveStatusUpdate(BaseModel):
    status: str

class DashboardStats(BaseModel):
    attendance_percentage: float
    pending_leaves: int
    next_holiday: Optional[str]
    total_employees: int
    present_today: int
    on_leave_today: int

class PayrollResponse(BaseModel):
    user_id: int
    name: str
    month: str
    base_salary: float
    tax: float
    deductions: float
    net_salary: float
    absent_days: int
    working_days: int

# ============================================================
# FastAPI App Setup
# ============================================================

app = FastAPI(
    title="HRMS Backend API",
    description="High-performance Python backend for HRMS system (Postgres/SQLite)",
    version="1.0.0"
)

# CORS Configuration for Render Deployment (Allow All)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Vercel/Render communication
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Helper Functions
# ============================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    return user

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# ============================================================
# Startup Seeding (For Render Ephemeral Disk)
# ============================================================

@app.on_event("startup")
def startup_db_check():
    """
    Check if DB is empty on startup (Render restarts wipe disk if using SQLite).
    If empty, seed initial data.
    """
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        
        # Check if Admin exists
        if not db.query(User).filter(User.email == "admin@hrms.com").first():
            logger.info("Database empty! Seeding initial data...")
            
             # Seed Admin
            admin = User(
                email="admin@hrms.com",
                name="Admin User",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN.value,
                department="Management",
                position="HR Administrator",
                base_salary=80000
            )
            db.add(admin)
            
            # Seed Employee
            employee = User(
                email="employee@hrms.com",
                name="John Employee",
                hashed_password=get_password_hash("user123"),
                role=UserRole.EMPLOYEE.value,
                department="Engineering",
                position="Software Developer",
                base_salary=50000
            )
            db.add(employee)
            db.commit()

            # Seed 5 Mock Attendance Records
            today = date.today()
            for i in range(5):
                d = today - timedelta(days=i+1)
                db.add(Attendance(
                    user_id=employee.id,
                    date=d,
                    status="Present",
                    in_time=time(9,0),
                    out_time=time(18,0),
                    work_hours="9h 0m"
                ))
            db.commit()
            logger.info("Seeding complete!")
        else:
            logger.info("Database already initialized.")
            
    except Exception as e:
        logger.error(f"Startup Seeding Failed: {e}")
    finally:
        db.close()
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    return user

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# ============================================================
# Database Initialization Endpoint
# ============================================================

@app.get("/init-db")
async def init_database(db: Session = Depends(get_db)):
    """
    Initialize database tables and seed data.
    Useful for Vercel deployment where we can't run terminal commands easily.
    """
    try:
        # Create Tables
        Base.metadata.create_all(bind=engine)
        
        # Check if initialized
        if db.query(User).count() > 0:
            return {"message": "Database already initialized"}
            
        # Seed Admin
        admin = User(
            email="admin@hrms.com",
            name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN.value,
            department="Management",
            position="HR Administrator",
            base_salary=80000
        )
        db.add(admin)
        
        # Seed Employee
        employee = User(
            email="employee@hrms.com",
            name="John Employee",
            hashed_password=get_password_hash("user123"),
            role=UserRole.EMPLOYEE.value,
            department="Engineering",
            position="Software Developer",
            base_salary=50000
        )
        db.add(employee)
        
        db.commit()
        return {"message": "Database initialized and seeded successfully!"}
        
    except Exception as e:
        logger.error(f"Init DB Error: {e}")
        return {"error": str(e)}

# ============================================================
# Endpoints (Restored SQLAlchemy Logic)
# ============================================================

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }

@app.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)
    
    if current_user.role == UserRole.ADMIN.value:
        total_employees = db.query(User).filter(User.role == UserRole.EMPLOYEE.value).count()
        total_attendance = db.query(Attendance).filter(Attendance.date >= thirty_days_ago).count()
        working_days = 22
        expected = total_employees * working_days if total_employees > 0 else 1
        att_pct = min(100, (total_attendance / expected) * 100)
    else:
        total_employees = 1
        user_att = db.query(Attendance).filter(and_(
            Attendance.user_id == current_user.id,
            Attendance.date >= thirty_days_ago
        )).count()
        att_pct = min(100, (user_att / 22) * 100)
    
    # Pending Leaves
    if current_user.role == UserRole.ADMIN.value:
        pending = db.query(Leave).filter(Leave.status == LeaveStatus.PENDING.value).count()
    else:
        pending = db.query(Leave).filter(and_(
            Leave.user_id == current_user.id,
            Leave.status == LeaveStatus.PENDING.value
        )).count()
    
    # Next Holiday
    next_nav = db.query(Holiday).filter(Holiday.date >= today).order_by(Holiday.date).first()
    next_holiday_str = f"{next_nav.name} ({next_nav.date.strftime('%b %d, %Y')})" if next_nav else None

    # Present Today
    present_today = db.query(Attendance).filter(and_(
        Attendance.date == today,
        Attendance.status == "Present"
    )).count()
    
    # On Leave Today
    on_leave_today = db.query(Leave).filter(and_(
        Leave.start_date <= today,
        Leave.end_date >= today,
        Leave.status == LeaveStatus.APPROVED.value
    )).count()
    
    total_emp_count = db.query(User).filter(User.role == UserRole.EMPLOYEE.value).count()

    return DashboardStats(
        attendance_percentage=round(att_pct, 1),
        pending_leaves=pending,
        next_holiday=next_holiday_str,
        total_employees=total_emp_count,
        present_today=present_today,
        on_leave_today=on_leave_today
    )

@app.post("/attendance/check-in", response_model=AttendanceResponse)
async def check_in(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    now = datetime.now().time()
    
    if today.weekday() >= 5: 
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot check in on weekends (Saturday/Sunday).")

    # Last attendance logic (find last one for user)
    last_attendance = db.query(Attendance).filter(
        Attendance.user_id == current_user.id
    ).order_by(Attendance.date.desc(), Attendance.id.desc()).first()

    if last_attendance and last_attendance.out_time is None and last_attendance.date == today:
         raise HTTPException(status.HTTP_400_BAD_REQUEST, "You are already checked in! Please check out first.")
    
    existing_today = db.query(Attendance).filter(and_(
        Attendance.user_id == current_user.id,
        Attendance.date == today
    )).first()
    
    if existing_today and existing_today.out_time:
         raise HTTPException(status.HTTP_400_BAD_REQUEST, "You have already completed your shift for today.")
    
    status_val = "Present" if now <= time(9, 30, 0) else "Late"
    
    new_att = Attendance(
        user_id=current_user.id,
        date=today,
        status=status_val,
        in_time=now
    )
    db.add(new_att)
    db.commit()
    db.refresh(new_att)
    return new_att

@app.post("/attendance/check-out", response_model=AttendanceResponse)
async def check_out(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    now = datetime.now().time()
    
    # Find active check-in
    attendance = db.query(Attendance).filter(and_(
        Attendance.user_id == current_user.id,
        Attendance.date == today,
        Attendance.out_time.is_(None)
    )).first()
    
    if not attendance:
        completed = db.query(Attendance).filter(and_(
            Attendance.user_id == current_user.id,
            Attendance.date == today,
            Attendance.out_time.is_not(None)
        )).first()
        if completed:
             raise HTTPException(status.HTTP_400_BAD_REQUEST, "You have already checked out today.")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You are not checked in. Please check in first.")
    
    # Calculate hours
    if attendance.in_time:
        in_datetime = datetime.combine(today, attendance.in_time)
        out_datetime = datetime.combine(today, now)
        dur = out_datetime - in_datetime
        h, m = dur.seconds // 3600, (dur.seconds % 3600) // 60
        attendance.work_hours = f"{h}h {m}m"
    
    attendance.out_time = now
    db.commit()
    db.refresh(attendance)
    return attendance

@app.get("/attendance/my-history", response_model=List[AttendanceResponse])
async def get_my_attendance_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    start_date = today - timedelta(days=7)
    
    records = db.query(Attendance).filter(and_(
        Attendance.user_id == current_user.id,
        Attendance.date >= start_date
    )).order_by(Attendance.date.desc()).all()
    return records

@app.get("/attendance/today")
async def get_today_attendance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    att = db.query(Attendance).filter(and_(
        Attendance.user_id == current_user.id,
        Attendance.date == today
    )).first()
    
    if not att:
        return {"checked_in": False, "checked_out": False, "attendance": None}
    
    return {
        "checked_in": True,
        "checked_out": att.out_time is not None,
        "attendance": AttendanceResponse.model_validate(att)
    }

@app.post("/leaves", response_model=LeaveResponse)
async def apply_for_leave(leave_data: LeaveCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if leave_data.end_date < leave_data.start_date:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "End date must be after start date")
    
    if leave_data.start_date < date.today():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot apply for leave in the past")
    
    # Overlap
    # (StartA <= EndB) and (EndA >= StartB)
    overlap = db.query(Leave).filter(and_(
        Leave.user_id == current_user.id,
        Leave.status.in_([LeaveStatus.PENDING.value, LeaveStatus.APPROVED.value]),
        Leave.start_date <= leave_data.end_date,
        Leave.end_date >= leave_data.start_date
    )).first()
    
    if overlap:
         raise HTTPException(status.HTTP_400_BAD_REQUEST, f"You already have a {overlap.status} leave request for this period.")

    new_leave = Leave(
        user_id=current_user.id,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        reason=leave_data.reason,
        leave_type=leave_data.leave_type,
        status=LeaveStatus.PENDING.value
    )
    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)
    return new_leave

@app.get("/leaves", response_model=List[LeaveResponse])
async def get_leaves(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.ADMIN.value:
        res = db.query(Leave).order_by(Leave.applied_at.desc()).all()
    else:
        res = db.query(Leave).filter(Leave.user_id == current_user.id).order_by(Leave.applied_at.desc()).all()
        
    result = []
    for leave in res:
        user = db.query(User).filter(User.id == leave.user_id).first()
        result.append(LeaveResponse(
            id=leave.id,
            start_date=leave.start_date,
            end_date=leave.end_date,
            reason=leave.reason,
            leave_type=leave.leave_type,
            status=leave.status,
            applied_at=leave.applied_at,
            user_id=leave.user_id,
            user_name=user.name if user else None
        ))
    return result

@app.put("/leaves/{leave_id}/status", response_model=LeaveResponse)
async def update_leave_status(leave_id: int, status_update: LeaveStatusUpdate, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Leave request not found")
        
    if status_update.status not in [LeaveStatus.APPROVED.value, LeaveStatus.REJECTED.value]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid status")
    
    leave.status = status_update.status
    leave.reviewed_at = datetime.now()
    leave.reviewed_by = admin.id
    
    db.commit()
    db.refresh(leave)
    
    user = db.query(User).filter(User.id == leave.user_id).first()
    
    return LeaveResponse(
        id=leave.id,
        start_date=leave.start_date,
        end_date=leave.end_date,
        reason=leave.reason,
        leave_type=leave.leave_type,
        status=leave.status,
        applied_at=leave.applied_at,
        user_id=leave.user_id,
        user_name=user.name if user else None
    )

@app.get("/payroll/me", response_model=PayrollResponse)
async def get_my_payroll(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    start_of_month = date(today.year, today.month, 1)
    working_days = 22
    
    present_days = db.query(Attendance).filter(and_(
        Attendance.user_id == current_user.id,
        Attendance.date >= start_of_month,
        Attendance.status.in_(["Present", "Late", "Half-day"])
    )).count()
                        
    absent_days = max(0, working_days - present_days)
    base = float(current_user.base_salary) if hasattr(current_user, 'base_salary') and current_user.base_salary else 50000.0
    tax = base * 0.12
    deductions = (base / 30) * absent_days
    net = base - tax - deductions
    
    return PayrollResponse(
        user_id=current_user.id,
        name=current_user.name,
        month=today.strftime("%B %Y"),
        base_salary=round(base, 2),
        tax=round(tax, 2),
        deductions=round(deductions, 2),
        net_salary=round(net, 2),
        absent_days=absent_days,
        working_days=working_days
    )
