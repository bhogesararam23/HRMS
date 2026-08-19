"""
Authentication and Authorization Test Suite for NexusHR Backend.
"""
import pytest


def test_login_success_admin(client):
    """Test successful admin authentication and token schema."""
    response = client.post(
        "/token",
        data={"username": "admin@hrms.com", "password": "admin123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "admin"
    assert data["email"] == "admin@hrms.com"
    assert data["name"] == "Aditya Verma"


def test_login_success_employee(client):
    """Test successful employee authentication."""
    response = client.post(
        "/token",
        data={"username": "rahul@hrms.com", "password": "pass123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "employee"
    assert data["email"] == "rahul@hrms.com"


def test_login_invalid_password(client):
    """Test login failure with wrong password."""
    response = client.post(
        "/token",
        data={"username": "admin@hrms.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_nonexistent_user(client):
    """Test login failure for nonexistent email."""
    response = client.post(
        "/token",
        data={"username": "ghost@hrms.com", "password": "pass123"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_unauthenticated_request_rejected(client):
    """Test that protected endpoints reject requests without token."""
    response = client.get("/dashboard/stats")
    assert response.status_code == 401


def test_invalid_token_rejected(client):
    """Test that invalid bearer tokens are rejected."""
    headers = {"Authorization": "Bearer completely-invalid-jwt-token"}
    response = client.get("/dashboard/stats", headers=headers)
    assert response.status_code == 401


def test_dashboard_stats_employee(client, employee_token):
    """Test that employee can access role-scoped dashboard statistics."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    response = client.get("/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "attendance_percentage" in data
    assert "pending_leaves" in data
    assert "total_employees" in data


def test_dashboard_stats_admin(client, admin_token):
    """Test that admin can access system-wide dashboard statistics."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "attendance_percentage" in data
    assert "pending_leaves" in data
    assert "present_today" in data
