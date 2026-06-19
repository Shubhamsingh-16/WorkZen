# ⚡ WorkZen — Team Task Manager

Hey! 👋
This is a full-stack task management app I built to understand how real-world tools like Jira or Linear actually work behind the scenes.

I didn’t want to just build a basic todo app — I wanted something that feels like a **real product**, with proper roles, activity tracking, Kanban boards, and a clean SaaS-style UI.

---

## 🌐 Live Demo

* **Frontend:** https://work-zen-flame.vercel.app/
* **Backend API:** https://workzen-production.up.railway.app

---

## 🔑 Demo Accounts

| Role   | Email                                             | Password   |
| ------ | ------------------------------------------------- | ---------- |
| Admin  | [admin@workzen.com](mailto:admin@workzen.com)     | Admin@123  |
| Member | [alice@workzen.com](mailto:alice@workzen.com)     | Member@123 |
| Member | [bob@workzen.com](mailto:bob@workzen.com)         | Member@123 |
| Member | [charlie@workzen.com](mailto:charlie@workzen.com) | Member@123 |

---

## 📸 What it looks like

* Clean login/signup with demo accounts
* Dashboard with stats and activity feed
* Kanban board with drag & drop
* Member management panel

---

## 🧠 How it’s built

```
Frontend (React)
      ↓
Backend API (Express)
      ↓
Prisma ORM
      ↓
PostgreSQL
```

---

## 🛠 Tech Stack

* React (Vite) + Tailwind CSS
* Node.js + Express
* PostgreSQL + Prisma ORM
* JWT authentication
* bcrypt for password hashing
* express-validator

---

## ✨ Features

This is not just CRUD — it includes activity logs, Kanban workflow, and bulk operations.

---

### 🔐 Authentication

* Signup & login with JWT
* Password hashing using bcrypt
* Demo account quick access
* Show/hide password toggle
* Deactivated users cannot log in
* Tracks user activity

---

### 👥 Roles (Admin vs Member)

**Admins can:**

* Manage users
* Assign and update tasks
* View analytics
* Perform bulk actions

**Members can:**

* View assigned tasks
* Update task status
* Track progress

---

### 📋 Task Management

* Create, edit, delete tasks
* Assign tasks to users
* Status flow:

  * TODO → IN_PROGRESS → REVIEW → DONE
* Priority:

  * LOW / MEDIUM / HIGH / CRITICAL
* Overdue detection
* Comments
* Bulk actions

---

### 📊 Dashboard

**Admin:**

* Workspace stats
* Task pipeline
* Top performers
* Overdue alerts
* Activity feed

**Member:**

* Personal tasks
* Completion rate
* Progress tracking

---

### 🗂 Projects

* Create, edit, archive projects
* Add/remove members
* Track progress

---

### 📋 Kanban Board

* Drag & drop tasks
* Smooth animations
* Priority indicators

---

### 📈 Activity Feed

Tracks:

* Task creation
* Updates
* Comments
* Login activity
* Bulk actions

---

### 🎨 UI/UX

* Clean SaaS-style design
* Dark mode 🌙
* Smooth animations
* Toast notifications
* Responsive layout

---

## 🚀 Running Locally

### Clone repository

```bash
git clone https://github.com/yourname/workzen.git
cd workzen
```

---

### Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
PORT=3001
```

Run:

```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

---

### Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## 📡 APIs

* `/api/auth/*`
* `/api/admin/*`
* `/api/tasks/*`
* `/api/projects/*`
* `/api/activity`

---

## 🗄 Database

* User
* Project
* ProjectMember
* Task
* Comment
* ActivityLog

---

## 📁 Project Structure

```
workzen/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── index.js

└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── pages/
        ├── store/
        └── utils/
```

---

## 🔒 Security

* Password hashing with bcrypt
* JWT authentication
* Protected routes
* Role-based access

---

## 💡 Why I built this

I wanted to build something that:

* Feels like a real team tool
* Has proper backend structure
* Includes real-world features

---

## 🚢 Deployment

* Backend → Railway
* Frontend → Railway

---

⭐ If you liked this, feel free to star the repo!
