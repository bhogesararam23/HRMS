"""
Pytest configuration and fixtures for HRMS test suite.
Uses an isolated in-memory SQLite database with StaticPool for test execution.
"""
import sys
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database import Base, get_db
from models import User, Attendance, Leave, Holiday, UserRole, LeaveStatus
from main import app, get_password_hash

# Single in-memory SQLite engine with StaticPool so all sessions share the DB
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def setup_test_db():
    """Create and seed the test database before each test, drop after."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()

    # Seed Admin User
    admin = User(
        email="admin@hrms.com",
        name="Aditya Verma",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN.value,
        department="Management",
        position="Administrator",
        base_salary=2000000
    )
    # Seed Regular Employee
    employee = User(
        email="rahul@hrms.com",
        name="Rahul Sharma",
        hashed_password=get_password_hash("pass123"),
        role=UserRole.EMPLOYEE.value,
        department="Engineering",
        position="Senior Developer",
        base_salary=1200000
    )
    session.add(admin)
    session.add(employee)
    session.commit()
    session.close()

    yield

    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_token(client):
    """Obtain JWT access token for Admin user."""
    response = client.post(
        "/token",
        data={"username": "admin@hrms.com", "password": "admin123"}
    )
    assert response.status_code == 200, f"Token request failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture
def employee_token(client):
    """Obtain JWT access token for Regular Employee user."""
    response = client.post(
        "/token",
        data={"username": "rahul@hrms.com", "password": "pass123"}
    )
    assert response.status_code == 200, f"Token request failed: {response.text}"
    return response.json()["access_token"]
