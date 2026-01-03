"""
Plain Python Models for In-Memory DB (Vercel)
"""
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    EMPLOYEE = "employee"

class LeaveStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class User:
    def __init__(self, id=None, email=None, name=None, hashed_password=None, role="employee", department="General", position="Staff", phone=None, base_salary=50000):
        self.id = id
        self.email = email
        self.name = name
        self.hashed_password = hashed_password
        self.role = role
        self.department = department
        self.position = position
        self.phone = phone
        self.base_salary = base_salary
        self.created_at = datetime.now()
        # Relationships (simulated)
        self.attendances = []
        self.leaves = []

class Attendance:
    def __init__(self, id=None, user_id=None, date=None, status="Present", in_time=None, out_time=None, work_hours=None):
        self.id = id
        self.user_id = user_id
        self.date = date
        self.status = status
        self.in_time = in_time
        self.out_time = out_time
        self.work_hours = work_hours
        self.created_at = datetime.now()
        # Relationship
        self.user = None

class Leave:
    def __init__(self, id=None, user_id=None, start_date=None, end_date=None, reason=None, leave_type="Annual", status="Pending"):
        self.id = id
        self.user_id = user_id
        self.start_date = start_date
        self.end_date = end_date
        self.reason = reason
        self.leave_type = leave_type
        self.status = status
        self.applied_at = datetime.now()
        self.reviewed_at = None
        self.reviewed_by = None
        # Relationship
        self.user = None

class Holiday:
    def __init__(self, id=None, name=None, date=None, description=None):
        self.id = id
        self.name = name
        self.date = date
        self.description = description
