"""
Attendance State Machine and Shift Tracking Test Suite.
"""
import pytest
from datetime import date


def test_today_status_initial(client, employee_token):
    """Test attendance status before any check-in."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    response = client.get("/attendance/today", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["checked_in"] is False
    assert data["checked_out"] is False
    assert data["attendance"] is None


def test_check_in_flow(client, employee_token):
    """Test check-in records status, timestamp, and updates today's status."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    response = client.post("/attendance/check-in", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["date"] == date.today().isoformat()
    assert data["status"] in ["Present", "Late"]
    assert data["in_time"] is not None

    # Check today status reflects check-in
    today_res = client.get("/attendance/today", headers=headers)
    assert today_res.status_code == 200
    today_data = today_res.json()
    assert today_data["checked_in"] is True
    assert today_data["checked_out"] is False


def test_double_check_in_prevented(client, employee_token):
    """Test that an employee cannot check in multiple times simultaneously."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    
    # First check-in
    first_res = client.post("/attendance/check-in", headers=headers)
    assert first_res.status_code == 200

    # Second check-in should fail
    second_res = client.post("/attendance/check-in", headers=headers)
    assert second_res.status_code == 400
    assert "already checked in" in second_res.json()["detail"].lower()


def test_check_out_flow(client, employee_token):
    """Test full check-in to check-out shift completion flow."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    
    # Check in
    client.post("/attendance/check-in", headers=headers)

    # Check out
    out_res = client.post("/attendance/check-out", headers=headers)
    assert out_res.status_code == 200
    out_data = out_res.json()
    assert out_data["out_time"] is not None
    assert out_data["work_hours"] is not None

    # Check today status reflects completed shift
    today_res = client.get("/attendance/today", headers=headers)
    assert today_res.status_code == 200
    today_data = today_res.json()
    assert today_data["checked_in"] is True
    assert today_data["checked_out"] is True


def test_check_out_without_check_in(client, employee_token):
    """Test that check-out without prior check-in is rejected."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    response = client.post("/attendance/check-out", headers=headers)
    assert response.status_code == 400
    assert "not checked in" in response.json()["detail"].lower()


def test_check_in_after_shift_completed(client, employee_token):
    """Test that an employee cannot start a new shift after completing one for the day."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    
    client.post("/attendance/check-in", headers=headers)
    client.post("/attendance/check-out", headers=headers)

    # Try to check in again
    recheck_res = client.post("/attendance/check-in", headers=headers)
    assert recheck_res.status_code == 400
    assert "completed your shift" in recheck_res.json()["detail"].lower()


def test_attendance_history(client, employee_token):
    """Test fetching employee attendance history."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    
    client.post("/attendance/check-in", headers=headers)
    client.post("/attendance/check-out", headers=headers)

    res = client.get("/attendance/my-history", headers=headers)
    assert res.status_code == 200
    records = res.json()
    assert isinstance(records, list)
    assert len(records) >= 1
