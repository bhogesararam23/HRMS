"""
Leave Application, Validation, and Approval Workflow Test Suite.
"""
import pytest
from datetime import date, timedelta


def test_apply_leave_success(client, employee_token):
    """Test successful leave application submission."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    start = date.today() + timedelta(days=5)
    end = date.today() + timedelta(days=7)

    payload = {
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "leave_type": "Annual",
        "reason": "Family vacation trip"
    }

    response = client.post("/leaves", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Pending"
    assert data["leave_type"] == "Annual"
    assert data["reason"] == "Family vacation trip"


def test_apply_leave_past_date_rejected(client, employee_token):
    """Test that applying for retroactive past leave is rejected."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    start = date.today() - timedelta(days=3)
    end = date.today() - timedelta(days=1)

    payload = {
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "leave_type": "Sick",
        "reason": "Past sickness"
    }

    response = client.post("/leaves", json=payload, headers=headers)
    assert response.status_code == 400
    assert "past" in response.json()["detail"].lower()


def test_apply_leave_end_before_start_rejected(client, employee_token):
    """Test that leave with end date before start date is rejected."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    start = date.today() + timedelta(days=10)
    end = date.today() + timedelta(days=5)

    payload = {
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "leave_type": "Personal",
        "reason": "Invalid dates"
    }

    response = client.post("/leaves", json=payload, headers=headers)
    assert response.status_code == 400
    assert "after start date" in response.json()["detail"].lower()


def test_overlapping_leave_conflict_rejected(client, employee_token):
    """Test that overlapping leave requests for the same employee are rejected."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    start1 = date.today() + timedelta(days=15)
    end1 = date.today() + timedelta(days=20)

    # First leave
    res1 = client.post("/leaves", json={
        "start_date": start1.isoformat(),
        "end_date": end1.isoformat(),
        "leave_type": "Annual",
        "reason": "First leave block"
    }, headers=headers)
    assert res1.status_code == 200

    # Overlapping leave
    start2 = date.today() + timedelta(days=18)
    end2 = date.today() + timedelta(days=22)
    res2 = client.post("/leaves", json={
        "start_date": start2.isoformat(),
        "end_date": end2.isoformat(),
        "leave_type": "Sick",
        "reason": "Conflicting leave block"
    }, headers=headers)
    assert res2.status_code == 400
    assert "already have a" in res2.json()["detail"].lower()


def test_admin_approve_leave(client, employee_token, admin_token):
    """Test admin approving a pending leave request."""
    emp_headers = {"Authorization": f"Bearer {employee_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Apply leave
    start = date.today() + timedelta(days=30)
    end = date.today() + timedelta(days=32)
    create_res = client.post("/leaves", json={
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "leave_type": "Casual",
        "reason": "Conference attendance"
    }, headers=emp_headers)
    leave_id = create_res.json()["id"]

    # Admin approves
    approve_res = client.put(
        f"/leaves/{leave_id}/status",
        json={"status": "Approved"},
        headers=admin_headers
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "Approved"


def test_admin_reject_leave(client, employee_token, admin_token):
    """Test admin rejecting a pending leave request."""
    emp_headers = {"Authorization": f"Bearer {employee_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    start = date.today() + timedelta(days=40)
    end = date.today() + timedelta(days=42)
    create_res = client.post("/leaves", json={
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "leave_type": "Personal",
        "reason": "Personal errands"
    }, headers=emp_headers)
    leave_id = create_res.json()["id"]

    # Admin rejects
    reject_res = client.put(
        f"/leaves/{leave_id}/status",
        json={"status": "Rejected"},
        headers=admin_headers
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["status"] == "Rejected"


def test_employee_cannot_approve_leave(client, employee_token):
    """Test that a regular employee cannot review/approve leave requests (403 Forbidden)."""
    emp_headers = {"Authorization": f"Bearer {employee_token}"}

    start = date.today() + timedelta(days=50)
    end = date.today() + timedelta(days=52)
    create_res = client.post("/leaves", json={
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "leave_type": "Sick",
        "reason": "Medical checkup"
    }, headers=emp_headers)
    leave_id = create_res.json()["id"]

    # Attempt approve with employee token
    approve_res = client.put(
        f"/leaves/{leave_id}/status",
        json={"status": "Approved"},
        headers=emp_headers
    )
    assert approve_res.status_code == 403
    assert "admin" in approve_res.json()["detail"].lower()
