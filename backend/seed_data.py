
import sys
import os
from datetime import date, timedelta, time, datetime
from sqlalchemy import create_engine
from passlib.context import CryptContext

# Ensure we can import from backend modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, Base, engine
from models import User, Attendance, Leave, UserRole, LeaveStatus

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def seed_users(db):
    print("--- Seeding Users ---")
    users = [
        {
            "email": "admin@hrms.com",
            "password": "admin123",
            "name": "Aditya Verma",
            "role": UserRole.ADMIN.value,
            "department": "Management",
            "position": "Administrator",
            "base_salary": 2000000
        },
        {
            "email": "rahul@hrms.com",
            "password": "pass123",
            "name": "Rahul Sharma",
            "role": UserRole.EMPLOYEE.value,
            "department": "Engineering",
            "position": "Senior Developer",
            "base_salary": 1200000
        },
        {
            "email": "priya@hrms.com",
            "password": "pass123",
            "name": "Priya Patel",
            "role": UserRole.EMPLOYEE.value,
            "department": "HR",
            "position": "HR Manager",
            "base_salary": 900000
        },
        {
            "email": "amit@hrms.com",
            "password": "pass123",
            "name": "Amit Kumar",
            "role": UserRole.EMPLOYEE.value,
            "department": "Engineering",
            "position": "Intern",
            "base_salary": 300000
        }
    ]

    for u in users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            user = User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                name=u["name"],
                role=u["role"],
                department=u["department"],
                position=u["position"],
                base_salary=u["base_salary"]
            )
            db.add(user)
            print(f"Created user: {u['name']}")
        else:
            print(f"User already exists: {u['name']}")
    db.commit()

def seed_attendance(db):
    print("--- Seeding Attendance ---")
    rahul = db.query(User).filter(User.email == "rahul@hrms.com").first()
    if not rahul:
        print("Rahul not found, skipping attendance.")
        return

    today = date.today()
    # Insert for last 5 days
    for i in range(5):
        day_offset = 4 - i # 4 days ago to today (0)
        d = today - timedelta(days=day_offset)
        
        # Check if exists
        existing = db.query(Attendance).filter(Attendance.user_id == rahul.id, Attendance.date == d).first()
        if existing:
            continue

        # Pattern: 4 present, 1 absent/late
        if i < 4:
            # Present
            status = "Present"
            in_time = time(9, 30)
            out_time = time(18, 30)
            work_hours = "9h 0m"
            
            att = Attendance(
                user_id=rahul.id,
                date=d,
                status=status,
                in_time=in_time,
                out_time=out_time,
                work_hours=work_hours
            )
            db.add(att)
            print(f"Marked Present for Rahul on {d}")
        else:
            # Late (or Absent) - Let's do Late as per request "Absent or Late"
            status = "Late"
            in_time = time(10, 45)
            out_time = time(18, 30)
            work_hours = "7h 45m"
            
            att = Attendance(
                user_id=rahul.id,
                date=d,
                status=status,
                in_time=in_time,
                out_time=out_time,
                work_hours=work_hours
            )
            db.add(att)
            print(f"Marked Late for Rahul on {d}")
    
    db.commit()

def seed_leaves(db):
    print("--- Seeding Leaves ---")
    
    # Priya: Sick Leave
    priya = db.query(User).filter(User.email == "priya@hrms.com").first()
    if priya:
        start = date.today() + timedelta(days=2)
        end = date.today() + timedelta(days=3)
        reason = "Viral Fever"
        
        existing = db.query(Leave).filter(
            Leave.user_id == priya.id, 
            Leave.reason == reason
        ).first()
        
        if not existing:
            leave = Leave(
                user_id=priya.id,
                start_date=start,
                end_date=end,
                reason=reason,
                leave_type="Sick",
                status=LeaveStatus.APPROVED.value,
                reviewed_by=1, # Assuming Admin ID 1
                reviewed_at=datetime.now()
            )
            db.add(leave)
            print(f"Added Sick Leave for Priya")

    # Amit: Casual Leave
    amit = db.query(User).filter(User.email == "amit@hrms.com").first()
    if amit:
        start = date.today() + timedelta(days=10)
        end = date.today() + timedelta(days=12)
        reason = "Sister's Wedding"
        
        existing = db.query(Leave).filter(
            Leave.user_id == amit.id, 
            Leave.reason == reason
        ).first()
        
        if not existing:
            leave = Leave(
                user_id=amit.id,
                start_date=start,
                end_date=end,
                reason=reason,
                leave_type="Casual",
                status=LeaveStatus.PENDING.value
            )
            db.add(leave)
            print(f"Added Casual Leave for Amit")
            
    db.commit()

def main():
    print("Initializing Database Seeding...")
    Base.metadata.create_all(bind=engine) # Ensure tables exist
    
    db = SessionLocal()
    try:
        seed_users(db)
        seed_attendance(db)
        seed_leaves(db)
        print("Data Seeding Completed Successfully!")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
