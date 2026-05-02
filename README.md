⚡ WorkZen — Team Task Manager

Hey! 👋
This is a full-stack task management app I built to understand how real-world tools like Jira or Linear actually work behind the scenes.

I didn’t want to just build a basic todo app — I wanted something that feels like a real product, with proper roles, activity tracking, Kanban boards, and a clean SaaS-style UI.

--------------------------------------------------

🌐 Live Demo

Frontend: refreshing-compassion-production-1fed.up.railway.app
Backend API: workzen-production.up.railway.app

Demo Accounts:

Admin  → admin@workzen.com | Admin@123
Member → alice@workzen.com | Member@123
Member → bob@workzen.com   | Member@123
Member → charlie@workzen.com | Member@123

--------------------------------------------------

📸 What it looks like

- Clean login/signup with demo accounts
- Dashboard with stats and activity feed
- Kanban board with drag & drop
- Member management panel

--------------------------------------------------

🧠 How it’s built

Frontend (React)
↓
Backend API (Express)
↓
Prisma ORM
↓
PostgreSQL

--------------------------------------------------

🛠 Tech Stack

- React (Vite) + Tailwind CSS
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT authentication
- bcrypt for password hashing
- express-validator

--------------------------------------------------

✨ Features

This is not just CRUD — it includes activity logs, Kanban workflow, and bulk operations.

🔐 Authentication
- Signup & login with JWT
- Password hashing using bcrypt
- Demo account quick access
- Show/hide password toggle
- Deactivated users cannot log in
- Tracks user activity (lastActive)

👥 Roles (Admin vs Member)

Admins can:
- manage users
- assign and update tasks
- view analytics
- perform bulk actions

Members can:
- view assigned tasks
- update task status
- track their progress

📋 Task Management
- Create, edit, delete tasks
- Assign tasks to users
- Status flow: TODO → IN_PROGRESS → REVIEW → DONE
- Priority: LOW / MEDIUM / HIGH / CRITICAL
- Overdue detection
- Comments on tasks
- Bulk actions (admin only)

📊 Dashboard
Admin:
- workspace stats
- task pipeline
- top performers
- overdue alerts
- activity feed

Member:
- personal task list
- completion rate
- progress tracking

🗂 Projects
- Create, edit, archive projects
- Add/remove members
- Track progress

📋 Kanban Board
- Drag & drop tasks
- Smooth animations
- Priority indicators

📈 Activity Feed
Tracks:
- task creation
- updates
- comments
- login activity
- bulk actions

🎨 UI/UX
- Clean SaaS-style design
- Dark mode
- Smooth animations
- Toast notifications
- Responsive layout

--------------------------------------------------

🚀 Running Locally

1. Clone repo
git clone https://github.com/yourname/workzen.git
cd workzen

2. Backend setup
cd backend
npm install

Create .env:
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
PORT=3001

Run:
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev

Backend runs on:
http://localhost:3001

3. Frontend setup
cd ../frontend
npm install
npm run dev

Frontend runs on:
http://localhost:5173

--------------------------------------------------

📡 APIs

- Auth → /api/auth/*
- Admin → /api/admin/*
- Tasks → /api/tasks/*
- Projects → /api/projects/*
- Activity → /api/activity

--------------------------------------------------

🗄 Database

- User
- Project
- ProjectMember
- Task
- Comment
- ActivityLog

--------------------------------------------------

📁 Project Structure

workzen/
  backend/
    prisma/
    src/
      controllers/
      middleware/
      routes/
      index.js

  frontend/
    src/
      api/
      components/
      pages/
      store/
      utils/

--------------------------------------------------

🔒 Security

- Password hashing with bcrypt
- JWT-based authentication
- Protected routes
- Role-based access control
- Input validation

--------------------------------------------------

💡 Why I built this

I wanted to build something that:
- feels like a real team tool
- has proper backend architecture
- includes real-world features

--------------------------------------------------

🚢 Deployment

Backend → Railway 
Frontend → Railway

--------------------------------------------------


If you liked this, feel free to star ⭐ the repo
