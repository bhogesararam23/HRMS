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

**Built by Team Null Vector** | Hackathon 2026

---

# 😤 The Problem

<br>

- 📉 Traditional HR systems are **clunky and slow**

- 🧮 Payroll calculations are often **manual and error-prone**

- ⏰ No **real-time validation** for attendance

- 🐛 Edge cases like *"Future Date Deductions"* break everything

---

# 💡 Our Solution

<br>

## Introducing **NexusHR**

> "A Full-Stack solution that enforces **Business Logic at the API level**."

<br>

### Tech Stack
| Frontend | Backend |
|----------|---------|
| ⚡ React (Speed) | 🐍 FastAPI (Logic) |
| 🎨 TailwindCSS | 🗄️ SQLite/PostgreSQL |

---

# ✨ Key Features

<br>

### 🔐 Smart Attendance
> State-machine logic **prevents double check-ins** and enforces business rules.

### 💰 Automated Payroll
> Auto-detects month boundaries. **No more "ghost absences"** for future dates.

### 📄 Instant Payslips
> Professional PDF generation with **one click** using ReportLab.

---

# 🏗️ Technical Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   FRONTEND      │   API   │    BACKEND      │
│  React + Vite   │◄───────►│  FastAPI + SQL  │
│  TailwindCSS    │   JWT   │  Pydantic Valid │
└─────────────────┘         └─────────────────┘
```

### 🎯 The "Null Vector" Advantage

- ✅ **New Year Bug Fix** – Payroll only counts days *up to today*
- ✅ **Zero-Error Deductions** – No future-date ghost absences
- ✅ **Optimistic UI** – Instant feedback with proper loading states

---

<!-- _class: lead -->

# 🚀 Live Demo

<br>

### `localhost:3000`

<br>

*"Let's see it in action!"*

---

# 🔮 Future Scope & Conclusion

<br>

### What's Next?
- 🤖 **AI-Powered Hiring** – Smart resume screening
- 📱 **Mobile App** – React Native companion
- 📊 **Advanced Analytics** – Workforce insights dashboard

<br>

---

<!-- _class: lead -->

# 🙏 Thank You!

<br>

### Questions?

<br>

**Team Null Vector** | Hackathon 2026
