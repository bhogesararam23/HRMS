---
marp: true
theme: gaia
class: lead
paginate: true
backgroundColor: #1a1a2e
color: #eaeaea
style: |
  section {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  section.lead {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    text-align: center;
  }
  section.lead h1 {
    color: #00d9ff;
    font-size: 3.5em;
    text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
  }
  h1 {
    color: #00d9ff;
  }
  h2 {
    color: #e94560;
  }
  strong {
    color: #00d9ff;
  }
  code {
    background: #16213e;
    color: #00d9ff;
  }
  footer {
    color: #888;
  }
---

<!-- _class: lead -->

# 🚀 NexusHR

### The Logic-First Human Resource Management System

<br>

**Built by Team Null Vector** | Enterprise-Ready Full-Stack Platform

---

# 😤 The Problem With Legacy HRMS

<br>

- 📉 **Slow & Clunky Interfaces** – Fragile UI states and lagging user feedback.
- 🧮 **Ghost Payroll Deductions** – Naive algorithms deducting pay for *future dates* in the active month.
- ⏰ **Unregulated Attendance** – Double check-ins, missing duration calculations, and state corruption.
- 🏖️ **Chaotic Leave Conflicts** – Inverted dates, past leave abuse, and overlapping applications without audit trails.

---

# 💡 The NexusHR Solution

<br>

## **Logic-First Architecture**
> "We enforce strict **business rules and state-machine transitions at the API layer**, backing an ultra-responsive, beautiful frontend."

<br>

### The Core Pillars
| Module | Core Logic Advantage |
|:---|:---|
| 🔐 **Attendance** | Shift state-machine (Present $\le$ 09:30 AM, Late > 09:30 AM) |
| 💰 **Payroll** | Auto-detected month boundaries + Weekend/Holiday exclusions |
| 🏖️ **Leaves** | Automated conflict & overlap algorithm $(StartA \le EndB \land EndA \ge StartB)$ |
| 📄 **Payslips** | On-the-fly streaming PDF generation with ReportLab |

---

# 🛠️ Technology Stack

<br>

### ⚡ Frontend
- **React 19** with Hooks, Context API & React Router DOM v7
- **TailwindCSS 3.4** + PostCSS design token system
- **Radix UI / Shadcn Primitives** & Lucide Icons
- **Recharts** interactive data visualizations & Sonner toasts
- **CRACO** build orchestration & module aliases

### 🐍 Backend
- **Python FastAPI** – High-performance async ASGI architecture
- **SQLAlchemy 2.0 ORM** with Hybrid PostgreSQL / SQLite engine
- **OAuth2 + JWT (python-jose & passlib[bcrypt])**
- **ReportLab 4.x** server-side PDF stream rendering

---

# 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│   React 19  •  TailwindCSS  •  Shadcn UI  •  Recharts       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON / JWT Bearer
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    API & Business Logic                     │
│   FastAPI (Async ASGI)  •  Pydantic v2  •  OAuth2 / Jose    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Data Persistence        │ │      Document Engine       │
│  SQLAlchemy 2.0 ORM          │ │  ReportLab Canvas Engine   │
│  • SQLite (Local / Dev)      │ │  Server-side PDF streaming │
│  • PostgreSQL (Production)   │ └────────────────────────────┘
└──────────────────────────────┘
```

---

# 🎯 The "Null Vector" Advantage

<br>

### 1. Zero-Error Payroll Engine
- **Preceding Month Isolation**: Only computes finalized calendar months.
- **Deduction Formula**:
  $$\text{Working Days} = \text{Total Days} - (\text{Weekends} + \text{Holidays})$$
  $$\text{Deduction} = \frac{\text{Base Salary}}{\text{Days in Month}} \times \text{Unpaid Absences}$$

### 2. State-Machine Shift Attendance
- Enforces strict transition: `Checked Out` $\rightarrow$ `Checked In` $\rightarrow$ `Shift Completed`.
- Single check-in per calendar day prevents double-entry corruption.

---

# 🔄 Automated CI/CD Pipeline

<br>

### Continuous Integration with **GitHub Actions**

```
 🚀 Git Push / PR
       ├──► 🐍 Backend CI (Python 3.11)
       │      • Install dependencies
       │      • Execute Pytest Suite (24/24 Tests Passing)
       │      • Coverage & security checks
       └──► ⚡ Frontend CI (Node 20)
              • Dependency caching & install
              • Production bundle verification (CRACO)
```

- ✅ **Automated regression prevention on every pull request**
- ✅ **Isolated in-memory SQLite testing environment**

---

# 🧪 Comprehensive Test Verification

<br>

### 100% Test Suite Pass Rate across 24 Automated Tests

| Test Suite | Coverage Area | Status |
|:---|:---|:---:|
| `test_auth.py` | JWT Auth, Role Scopes, Admin RBAC, Token Validation | ✅ **PASSED** |
| `test_attendance.py` | Check-in, 09:30 AM Late rule, Shift lockout, History | ✅ **PASSED** |
| `test_leaves.py` | Past dates, Inverted ranges, Overlap detection, Admin approvals | ✅ **PASSED** |
| `test_payroll.py` | Salary breakdown, 12% Tax, ReportLab PDF Binary stream | ✅ **PASSED** |

> **All 24 backend automated tests & 10 UI modules tested and verified.**

---

<!-- _class: lead -->

# 🚀 Live Demo & Experience

<br>

### **`http://localhost:3000`**

<br>

| Role | Email | Password |
|:---|:---|:---|
| 👮‍♂️ **Administrator** | `admin@hrms.com` | `admin123` |
| 👨‍💻 **Senior Developer** | `rahul@hrms.com` | `pass123` |
| 👩‍💼 **HR Manager** | `priya@hrms.com` | `pass123` |

<br>

*"Let's explore NexusHR in action!"*

---

# 🔮 Future Roadmap

<br>

- 🤖 **AI-Powered Resume Screening**: NLP parsing and smart candidate scoring.
- 📱 **Mobile Application**: React Native companion with geo-fenced attendance.
- 🏢 **Multi-Tenant SaaS**: Organization-level isolation and custom leave policies.
- 💳 **Direct Bank Payouts**: Automated salary disbursement via payroll API gateways.

---

<!-- _class: lead -->

# 🙏 Thank You!

<br>

### Questions & Discussion

<br>

**Team Null Vector** | Hackathon 2026
