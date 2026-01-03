# NexusHR 🚀
> **The Intelligent Workforce Operating System.**  
> *Logic-First. Automation-Ready. Production-Grade.*

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

---

## 📋 Project Overview

**NexusHR** is a next-generation Human Resource Management System designed to eliminate administrative chaos through strict business logic and automation. Unlike traditional "dumb" CRUD applications, NexusHR enforces intelligent state management for attendance, prevents scheduling conflicts with smart leave validation, and delivers instant, accurate payroll calculations. 

Built with a high-performance **FastAPI** backend and a sleek **React 19** frontend, it offers a seamless, secure, and role-based experience for modern organizations.

---

## ✨ Key Features

### 🔐 Backend Intelligence (FastAPI + Python)
*   **Smart Attendance System:** State-machine enforced logic prevents "Double Check-ins" and ensures shifts are completed in valid sequences. Weekend restrictions included.
*   **Intelligent Leave Validation:** 
    *   Prevents application for past dates.
    *   **Overlap Detection:** Algorithmically blocks leave requests that conflict with existing approved or pending leaves.
*   **Automated Payroll Engine:** Real-time salary calculation engine that computes Tax (12%), Deductions (based on absent days), and Net Salary on defined base brackets.
*   **RBAC Security:** Secure JWT (JSON Web Token) authentication with strict separation between **Admin** and **Employee** roles.

### 💻 Frontend Excellence (React + Tailwind)
*   **Real-Time Dashboard:** Interactive visual analytics powered by **Recharts** to visualize attendance trends and leave statuses.
*   **Modern UI/UX:** Built with **Radix UI** primitives and **TailwindCSS** for a polished, accessible, and responsive interface.
*   **Instant Feedback:** Action-driven toast notifications via **Sonner** for success/error states (e.g., "Check-in Successful" or "Weekend Check-in Blocked").

---

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React 19 (via Vite/CRA)
*   **Styling:** TailwindCSS, Radix UI
*   **State & Forms:** React Hook Form, Zod (Validation)
*   **Visualization:** Recharts
*   **HTTP:** Axios

### Backend
*   **API:** FastAPI (Python 3.12+)
*   **Database:** SQLAlchemy ORM with SQLite
*   **Authentication:** Python-Jose (JWT), Passlib (Bcrypt)
*   **Validation:** Pydantic Models

---

## 🚀 Installation & Setup Guide

### Prerequisites
*   Python 3.10+
*   Node.js 18+

### 1️⃣ Backend Setup
```bash
cd backend

# Create virtual environment (Optional but Recommended)
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Run the Server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*Server runs at `http://localhost:8000`*

### 2️⃣ Frontend Setup
```bash
cd frontend

# Install Node Modules
npm install

# Start Development Server
npm start
```
*App runs at `http://localhost:3000`*

---

## 🔑 Default Credentials (For Demo)
| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@hrms.com` | `admin123` |
| **Employee** | `employee@hrms.com` | `user123` |

---

## 📡 API Documentation
Key endpoints available in the system:

| Method | Endpoint | Description |
|:---:|---|---|
| `POST` | `/token` | Authenticate user & retrieve Access Token |
| `POST` | `/attendance/check-in` | **Strict** check-in (prevents duplicate sessions) |
| `POST` | `/attendance/check-out` | **Strict** check-out (requires active session) |
| `GET` | `/attendance/my-history` | Fetch last 7 days of attendance logs |
| `POST` | `/leaves` | Apply for leave (w/ Overlap & Date Validation) |
| `GET` | `/payroll/me` | **Dynamic Calculation** of Salary, Tax & Deductions |

---

Made with ❤️ by [Your Name]
