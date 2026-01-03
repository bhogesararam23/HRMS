"""
In-Memory Database for Vercel Serverless (No SQLite)
"""
from models import User, Attendance, Leave, Holiday, UserRole, LeaveStatus
from datetime import datetime, date, time, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global In-Memory Stores
users = []
attendances = []
leaves = []
holidays = []

# ID Counters
user_id_counter = 1
attendance_id_counter = 1
leave_id_counter = 1
holiday_id_counter = 1

# Mock Session Compatibility
class MockSession:
    def __init__(self):
        pass
    
    def add(self, obj):
        global user_id_counter, attendance_id_counter, leave_id_counter, holiday_id_counter
        
        if isinstance(obj, User):
            if not obj.id:
                obj.id = user_id_counter
                user_id_counter += 1
            users.append(obj)
            
        elif isinstance(obj, Attendance):
            if not obj.id:
                obj.id = attendance_id_counter
                attendance_id_counter += 1
            attendances.append(obj)
            
        elif isinstance(obj, Leave):
            if not obj.id:
                obj.id = leave_id_counter
                leave_id_counter += 1
            leaves.append(obj)
            
        elif isinstance(obj, Holiday):
            if not obj.id:
                obj.id = holiday_id_counter
                holiday_id_counter += 1
            holidays.append(obj)
            
    def commit(self):
        # No-op for in-memory
        pass
        
    def refresh(self, obj):
        # No-op for in-memory
        pass
        
    def close(self):
        pass
        
    # Helpers for main.py refactor
    @property
    def users(self): return users
    @property
    def attendances(self): return attendances
    @property
    def leaves(self): return leaves
    @property
    def holidays(self): return holidays

# Dependency
def get_db():
    try:
        db = MockSession()
        yield db
    finally:
        pass

# Password Hashing Helper (Duplicate from main.py to avoid circular import if needed, 
# but for seeding we need it. Better to pass hash in.)
# For simplicity, we will assume hashing happens before adding user, 
# OR we mock a simple hasher here for seeding. 
# actually we will import passlib here just for seeing.
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def init_db():
    """Seed initial data into lists"""
    global users, attendances, leaves, holidays
    
    if len(users) > 0:
        logger.info("Database already seeded.")
        return

    logger.info("Seeding in-memory database...")
    
    # Admin
    admin = User(
        email="admin@hrms.com",
        name="Admin User",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN.value,
        department="Management",
        position="HR Administrator"
    )
    
    # Employee
    employee = User(
        email="employee@hrms.com",
        name="John Employee",
        hashed_password=get_password_hash("user123"),
        role=UserRole.EMPLOYEE.value,
        department="Engineering",
        position="Software Developer"
    )
    
    # Session add
    db = MockSession()
    db.add(admin)
    db.add(employee)
    
    # Demo Employees
    db.add(User(email="sarah@hrms.com", name="Sarah Wilson", hashed_password=get_password_hash("user123"), role="employee", department="Marketing", position="Manager"))
    db.add(User(email="mike@hrms.com", name="Mike Johnson", hashed_password=get_password_hash("user123"), role="employee", department="Eng", position="Senior Dev"))
    
    # Seed Attendance
    today = date.today()
    # Add 5 days history for John
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
        # Ensure user relationship (manual in nosql)
        # In main.py we will look up user by ID, so relationship obj not strictly needed if we query right.
        
    # Seed Holidays
    db.add(Holiday(name="New Year", date=date(2026, 1, 1)))
    db.add(Holiday(name="Republic Day", date=date(2026, 1, 26)))

    logger.info("Seeding complete.")
