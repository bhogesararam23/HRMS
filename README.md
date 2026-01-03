# 🚀 NexusHR

**The Logic-First HRMS for the Future of Work.**

> 🏆 Built by **Team Null Vector** for Hackathon 2026

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)

---

## ✨ The "Null Vector" Advantage

| Feature | Description |
|---------|-------------|
| 🎯 **Zero-Error Payroll** | Auto-detects month boundaries to prevent future-date deductions. No more "ghost absences" for days that haven't happened yet. |
| 🔐 **Smart Attendance** | State-machine logic prevents double check-ins and enforces business rules at the API layer. |
| ⚡ **Local-First Speed** | Optimized React architecture with instant UI feedback using optimistic updates and proper loading states. |
| 📄 **PDF Generation** | Professional payslips generated server-side with ReportLab - no client-side dependencies required. |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with Hooks
- **TailwindCSS** for styling
- **Shadcn/UI** component library
- **Recharts** for data visualization
- **React Router DOM** for navigation

### Backend
- **Python FastAPI** - High-performance async API
- **SQLAlchemy ORM** - Database abstraction
- **SQLite** - Zero-config database (Postgres-ready)
- **Pydantic** - Data validation
- **ReportLab** - PDF generation
- **python-jose** - JWT authentication

---

## 🚀 Quick Start (Judge-Friendly!)

### Prerequisites
- Python 3.10+
- Node.js 18+

### Step 1: Backend Setup
```bash
cd backend
pip install -r requirements.txt
python seed_data.py
uvicorn main:app --reload
```
> Backend runs on `http://localhost:8000`

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm start
```
> Frontend runs on `http://localhost:3000`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👮‍♂️ **Admin** | `admin@hrms.com` | `admin123` |
| 👨‍💻 **Employee** | `rahul@hrms.com` | `pass123` |

---

## 📸 Screenshots

### Dashboard
![Dashboard Screenshot](screenshots/dashboard.png)

### Attendance
![Attendance Screenshot](screenshots/attendance.png)

### Payroll
![Payroll Screenshot](screenshots/payroll.png)

---

## 📂 Project Structure

```
HRMS/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── models.py         # SQLAlchemy models
│   ├── database.py       # DB configuration
│   ├── seed_data.py      # Demo data seeder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # UI components
│   │   └── contexts/     # Auth context
│   └── package.json
└── README.md
```

---

## 🎯 Features

- ✅ **Authentication** - JWT-based login with role-based access
- ✅ **Dashboard** - Real-time stats with charts
- ✅ **Attendance** - Check-in/out with state validation
- ✅ **Leave Management** - Apply, approve, reject workflow
- ✅ **Payroll** - Auto-calculated with PDF download
- ✅ **Responsive UI** - Works on desktop and mobile

---

## 👥 Team Null Vector

Built with ❤️ for Hackathon 2026

---

## 📜 License

MIT License - Feel free to use and modify!
