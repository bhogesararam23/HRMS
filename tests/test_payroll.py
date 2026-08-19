"""
Payroll Calculation and PDF Payslip Streaming Test Suite.
"""
import pytest


def test_get_payroll_me(client, employee_token):
    """Test calculating previous month's payroll breakdown for the authenticated user."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    response = client.get("/payroll/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert "name" in data
    assert "month" in data
    assert "base_salary" in data
    assert "tax" in data
    assert "deductions" in data
    assert "net_salary" in data
    assert "working_days" in data
    assert data["base_salary"] == 1200000.0
    assert data["tax"] == 144000.0  # 12% of 1,200,000


def test_download_payslip_pdf(client, employee_token):
    """Test generating and streaming a downloadable ReportLab PDF payslip."""
    headers = {"Authorization": f"Bearer {employee_token}"}
    response = client.get("/payroll/download", headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment; filename=" in response.headers["content-disposition"]
    # PDF magic bytes "%PDF-"
    assert response.content.startswith(b"%PDF-")
    assert len(response.content) > 500  # Valid binary PDF length
