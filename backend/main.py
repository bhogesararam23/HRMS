"""
HRMS Backend - FastAPI Application
High-performance Python backend with SQLite database
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

from database import engine, get_db, Base
from models import User, Attendance, Leave, Holiday, UserRole, LeaveStatus

# ============================================================
# Configuration
# ============================================================

# JWT Settings
SECRET_KEY = "hrms-super-secret-key-change-in-production-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Configure logging
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
    department: Optional[str]
    position: Optional[str]
    phone: Optional[str]
    
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
    status: str  # "Approved" or "Rejected"

class DashboardStats(BaseModel):
    attendance_percentage: float
    pending_leaves: int
    next_holiday: Optional[str]
    total_employees: int
    present_today: int
    on_leave_today: int

# ============================================================
# FastAPI App Setup
# ============================================================

app = FastAPI(
    title="HRMS Backend API",
    description="High-performance Python backend for HRMS system",
    version="1.0.0"
)

# CORS Configuration - Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Helper Functions
# ============================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email"""
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user from JWT token"""
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
    """Ensure the current user is an admin"""
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# ============================================================
# Database Initialization & Seeding
# ============================================================

def init_db():
    """Initialize database and seed with sample data if empty"""
    Base.metadata.create_all(bind=engine)
    
    db = next(get_db())
    
    try:
        # Check if data already exists
        user_count = db.query(User).count()
        if user_count > 0:
            logger.info("Database already seeded, skipping initialization.")
            return
        
        logger.info("Seeding database with initial data...")
        
        # Create Admin User
        admin = User(
            email="admin@hrms.com",
            name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN.value,
            department="Management",
            position="HR Administrator"
        )
        db.add(admin)
        
        # Create Employee User
        employee = User(
            email="employee@hrms.com",
            name="John Employee",
            hashed_password=get_password_hash("user123"),
            role=UserRole.EMPLOYEE.value,
            department="Engineering",
            position="Software Developer"
        )
        db.add(employee)
        
        # Create additional employees for demo
        demo_employees = [
            User(
                email="sarah.wilson@hrms.com",
                name="Sarah Wilson",
                hashed_password=get_password_hash("user123"),
                role=UserRole.EMPLOYEE.value,
                department="Marketing",
                position="Marketing Manager"
            ),
            User(
                email="mike.johnson@hrms.com",
                name="Mike Johnson",
                hashed_password=get_password_hash("user123"),
                role=UserRole.EMPLOYEE.value,
                department="Engineering",
                position="Senior Developer"
            ),
            User(
                email="emily.davis@hrms.com",
                name="Emily Davis",
                hashed_password=get_password_hash("user123"),
                role=UserRole.EMPLOYEE.value,
                department="HR",
                position="HR Specialist"
            ),
        ]
        for emp in demo_employees:
            db.add(emp)
        
        db.commit()
        db.refresh(admin)
        db.refresh(employee)
        
        # Create 5 dummy attendance records for employee
        today = date.today()
        for i in range(5):
            record_date = today - timedelta(days=i+1)
            attendance = Attendance(
                user_id=employee.id,
                date=record_date,
                status="Present",
                in_time=time(9, 0, 0),
                out_time=time(18, 0, 0),
                work_hours="9h 0m"
            )
            db.add(attendance)
        
        # Add some attendance for admin too
        for i in range(5):
            record_date = today - timedelta(days=i+1)
            attendance = Attendance(
                user_id=admin.id,
                date=record_date,
                status="Present",
                in_time=time(8, 30, 0),
                out_time=time(17, 30, 0),
                work_hours="9h 0m"
            )
            db.add(attendance)
        
        # Create 2 dummy leave requests
        leave1 = Leave(
            user_id=employee.id,
            start_date=today + timedelta(days=7),
            end_date=today + timedelta(days=9),
            reason="Family vacation",
            leave_type="Annual",
            status=LeaveStatus.PENDING.value
        )
        db.add(leave1)
        
        leave2 = Leave(
            user_id=employee.id,
            start_date=today + timedelta(days=15),
            end_date=today + timedelta(days=15),
            reason="Medical appointment",
            leave_type="Sick",
            status=LeaveStatus.APPROVED.value
        )
        db.add(leave2)
        
        # Create some holidays
        holidays = [
            Holiday(name="New Year's Day", date=date(2026, 1, 1), description="New Year Holiday"),
            Holiday(name="Republic Day", date=date(2026, 1, 26), description="Republic Day of India"),
            Holiday(name="Holi", date=date(2026, 3, 14), description="Festival of Colors"),
            Holiday(name="Independence Day", date=date(2026, 8, 15), description="Independence Day of India"),
            Holiday(name="Diwali", date=date(2026, 10, 20), description="Festival of Lights"),
            Holiday(name="Christmas", date=date(2026, 12, 25), description="Christmas Day"),
        ]
        for holiday in holidays:
            db.add(holiday)
        
        db.commit()
        logger.info("Database seeded successfully!")
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

# ============================================================
# Authentication Endpoints
# ============================================================

@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login.
    Returns access token and user info.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }

@app.post("/users/signup", response_model=UserResponse)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    # Check if user already exists
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role,
        department=user_data.department,
        position=user_data.position
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

# ============================================================
# Dashboard Endpoints
# ============================================================

@app.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics.
    """
    today = date.today()
    
    # Calculate attendance percentage (last 30 days)
    thirty_days_ago = today - timedelta(days=30)
    
    if current_user.role == UserRole.ADMIN.value:
        # Admin sees overall stats
        total_employees = db.query(User).filter(User.role == UserRole.EMPLOYEE.value).count()
        total_attendance = db.query(Attendance).filter(
            Attendance.date >= thirty_days_ago
        ).count()
        working_days = 22  # Approximate working days in a month
        expected_records = total_employees * working_days if total_employees > 0 else 1
        attendance_percentage = min(100, (total_attendance / expected_records) * 100)
    else:
        # Employee sees their own stats
        total_employees = 1
        user_attendance = db.query(Attendance).filter(
            and_(
                Attendance.user_id == current_user.id,
                Attendance.date >= thirty_days_ago
            )
        ).count()
        attendance_percentage = min(100, (user_attendance / 22) * 100)
    
    # Pending leaves count
    if current_user.role == UserRole.ADMIN.value:
        pending_leaves = db.query(Leave).filter(
            Leave.status == LeaveStatus.PENDING.value
        ).count()
    else:
        pending_leaves = db.query(Leave).filter(
            and_(
                Leave.user_id == current_user.id,
                Leave.status == LeaveStatus.PENDING.value
            )
        ).count()
    
    # Next holiday
    next_holiday = db.query(Holiday).filter(
        Holiday.date >= today
    ).order_by(Holiday.date).first()
    
    next_holiday_str = None
    if next_holiday:
        next_holiday_str = f"{next_holiday.name} ({next_holiday.date.strftime('%b %d, %Y')})"
    
    # Present today count
    present_today = db.query(Attendance).filter(
        and_(
            Attendance.date == today,
            Attendance.status == "Present"
        )
    ).count()
    
    # On leave today
    on_leave_today = db.query(Leave).filter(
        and_(
            Leave.start_date <= today,
            Leave.end_date >= today,
            Leave.status == LeaveStatus.APPROVED.value
        )
    ).count()
    
    total_emp_count = db.query(User).filter(User.role == UserRole.EMPLOYEE.value).count()
    
    return DashboardStats(
        attendance_percentage=round(attendance_percentage, 1),
        pending_leaves=pending_leaves,
        next_holiday=next_holiday_str,
        total_employees=total_emp_count,
        present_today=present_today,
        on_leave_today=on_leave_today
    )

# ============================================================
# Employee Endpoints (Admin Only)
# ============================================================

@app.get("/employees", response_model=List[UserResponse])
async def get_all_employees(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all employees. Admin only.
    """
    users = db.query(User).all()
    return users

@app.post("/employees", response_model=UserResponse)
async def create_employee(
    employee_data: EmployeeCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new employee. Admin only.
    """
    # Check if email exists
    existing = get_user_by_email(db, employee_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    new_employee = User(
        email=employee_data.email,
        name=employee_data.name,
        hashed_password=get_password_hash(employee_data.password),
        role=UserRole.EMPLOYEE.value,
        department=employee_data.department,
        position=employee_data.position,
        phone=employee_data.phone
    )
    
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    
    return new_employee

@app.get("/employees/{employee_id}", response_model=UserResponse)
async def get_employee(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific employee by ID.
    """
    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    return employee

# ============================================================
# Attendance Endpoints
# ============================================================

@app.post("/attendance/check-in", response_model=AttendanceResponse)
async def check_in(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check in for today. strict rules:
    1. No checking in on weekends (Sat/Sun).
    2. Cannot check in if already checked in (active session).
    """
    today = date.today()
    now = datetime.now().time()
    
    # Rule: No check-ins on weekends
    if today.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot check in on weekends (Saturday/Sunday)."
        )

    # Rule: Check last attendance record for open session
    last_attendance = db.query(Attendance).filter(
        Attendance.user_id == current_user.id
    ).order_by(Attendance.date.desc(), Attendance.id.desc()).first()

    if last_attendance and last_attendance.out_time is None and last_attendance.date == today:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already checked in! Please check out first."
        )
    
    # Also check if already checked in and out for today (single shift constraint)
    existing_today = db.query(Attendance).filter(
        and_(
            Attendance.user_id == current_user.id,
            Attendance.date == today
        )
    ).first()
    
    if existing_today and existing_today.out_time:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already completed your shift for today."
        )
    
    # Determine status based on time (9:30 AM is late limit)
    status_val = "Present"
    if now > time(9, 30, 0):
        status_val = "Late"
    
    attendance = Attendance(
        user_id=current_user.id,
        date=today,
        status=status_val,
        in_time=now
    )
    
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    
    return attendance

@app.post("/attendance/check-out", response_model=AttendanceResponse)
async def check_out(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check out for today. Strict rules:
    1. Must have an open check-in session.
    """
    today = date.today()
    now = datetime.now().time()
    
    # Find active check-in for today
    attendance = db.query(Attendance).filter(
        and_(
            Attendance.user_id == current_user.id,
            Attendance.date == today,
            Attendance.out_time.is_(None)
        )
    ).first()
    
    if not attendance:
        # Check if they already checked out today
        completed = db.query(Attendance).filter(
             and_(
                Attendance.user_id == current_user.id,
                Attendance.date == today,
                Attendance.out_time.is_not(None)
            )
        ).first()
        
        if completed:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already checked out today."
            )
            
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not checked in. Please check in first."
        )
    
    # Calculate work hours
    if attendance.in_time:
        in_datetime = datetime.combine(today, attendance.in_time)
        out_datetime = datetime.combine(today, now)
        work_duration = out_datetime - in_datetime
        hours = work_duration.seconds // 3600
        minutes = (work_duration.seconds % 3600) // 60
        attendance.work_hours = f"{hours}h {minutes}m"
    
    attendance.out_time = now
    db.commit()
    db.refresh(attendance)
    
    return attendance

@app.get("/attendance/my-history", response_model=List[AttendanceResponse])
async def get_my_attendance_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the logged-in user's attendance history for the past 7 days.
    """
    today = date.today()
    seven_days_ago = today - timedelta(days=7)
    
    records = db.query(Attendance).filter(
        and_(
            Attendance.user_id == current_user.id,
            Attendance.date >= seven_days_ago
        )
    ).order_by(Attendance.date.desc()).all()
    
    return records

@app.get("/attendance/today")
async def get_today_attendance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get today's attendance status for the current user.
    """
    today = date.today()
    
    attendance = db.query(Attendance).filter(
        and_(
            Attendance.user_id == current_user.id,
            Attendance.date == today
        )
    ).first()
    
    if not attendance:
        return {"checked_in": False, "checked_out": False, "attendance": None}
    
    return {
        "checked_in": True,
        "checked_out": attendance.out_time is not None,
        "attendance": AttendanceResponse.model_validate(attendance)
    }

# ============================================================
# Leave Endpoints
# ============================================================

@app.post("/leaves", response_model=LeaveResponse)
async def apply_for_leave(
    leave_data: LeaveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Apply for leave. Strict rules:
    1. Start date must be before End date.
    2. Cannot apply for past dates.
    3. No overlapping leave requests.
    """
    # 1. Date Validation
    if leave_data.end_date < leave_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date"
        )
    
    if leave_data.start_date < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot apply for leave in the past"
        )
        
    # 2. Overlap Validation
    # Check if any existing leave overlaps with requested dates
    overlapping_leave = db.query(Leave).filter(
        and_(
            Leave.user_id == current_user.id,
            Leave.status.in_([LeaveStatus.PENDING.value, LeaveStatus.APPROVED.value]),
            Leave.start_date <= leave_data.end_date,
            Leave.end_date >= leave_data.start_date
        )
    ).first()
    
    if overlapping_leave:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have a {overlapping_leave.status} leave request for this period ({overlapping_leave.start_date} to {overlapping_leave.end_date})."
        )
    
    leave = Leave(
        user_id=current_user.id,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        reason=leave_data.reason,
        leave_type=leave_data.leave_type,
        status=LeaveStatus.PENDING.value
    )
    
    db.add(leave)
    db.commit()
    db.refresh(leave)
    
    return LeaveResponse(
        id=leave.id,
        start_date=leave.start_date,
        end_date=leave.end_date,
        reason=leave.reason,
        leave_type=leave.leave_type,
        status=leave.status,
        applied_at=leave.applied_at,
        user_id=leave.user_id,
        user_name=current_user.name
    )

@app.get("/leaves", response_model=List[LeaveResponse])
async def get_leaves(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all leaves (Admin) or my leaves (Employee).
    """
    if current_user.role == UserRole.ADMIN.value:
        leaves = db.query(Leave).order_by(Leave.applied_at.desc()).all()
    else:
        leaves = db.query(Leave).filter(
            Leave.user_id == current_user.id
        ).order_by(Leave.applied_at.desc()).all()
    
    result = []
    for leave in leaves:
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
async def update_leave_status(
    leave_id: int,
    status_update: LeaveStatusUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Approve or Reject a leave request. Admin only.
    """
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found"
        )
    
    if status_update.status not in [LeaveStatus.APPROVED.value, LeaveStatus.REJECTED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'Approved' or 'Rejected'"
        )
        
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

# ============================================================
# Payroll Endpoints
# ============================================================

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

@app.get("/payroll/me", response_model=PayrollResponse)
async def get_my_payroll(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate dynamic payroll for the current month.
    Algorithm:
    - Base Salary from user profile (default 50000)
    - Tax = 12% of Base
    - Deductions = (Base / 30) * Absent Days
    - Net = Base - Tax - Deductions
    """
    today = date.today()
    start_of_month = date(today.year, today.month, 1)
    
    # Calculate absent days (simplified: 22 working days - present days)
    # Real world would be more complex with weekends/holidays logic
    working_days = 22
    present_days = db.query(Attendance).filter(
        and_(
            Attendance.user_id == current_user.id,
            Attendance.date >= start_of_month,
            Attendance.status.in_(["Present", "Late", "Half-day"])
        )
    ).count()
    
    # Ensure absent days is not negative (in case of extra work days)
    absent_days = max(0, working_days - present_days)
    
    # Financials
    base_salary = float(current_user.base_salary) if hasattr(current_user, 'base_salary') and current_user.base_salary else 50000.0
    tax = base_salary * 0.12
    
    daily_rate = base_salary / 30
    deductions = daily_rate * absent_days
    
    net_salary = base_salary - tax - deductions
    
    return PayrollResponse(
        user_id=current_user.id,
        name=current_user.name,
        month=today.strftime("%B %Y"),
        base_salary=round(base_salary, 2),
        tax=round(tax, 2),
        deductions=round(deductions, 2),
        net_salary=round(net_salary, 2),
        absent_days=absent_days,
        working_days=working_days
    )

# ============================================================
# User Profile Endpoints
# ============================================================

@app.get("/users/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get the current user's profile.
    """
    return current_user

# ============================================================
# Health Check
# ============================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "HRMS Backend API is running!", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.now().isoformat()
    }

# ============================================================
# Startup Event
# ============================================================

@app.on_event("startup")
async def startup_event():
    """Initialize database and seed data on startup"""
    logger.info("Starting HRMS Backend...")
    init_db()
    logger.info("HRMS Backend started successfully!")

# ============================================================
# Run with Uvicorn
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
