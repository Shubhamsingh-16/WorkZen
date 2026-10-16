const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Secret key to prevent accidental triggers
const SEED_SECRET = 'workzen-seed-2026';

router.get('/:secret', async (req, res) => {
  if (req.params.secret !== SEED_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // Wipe existing data
    await prisma.activityLog.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    const adminPwd  = await bcrypt.hash('Admin@123', 10);
    const memberPwd = await bcrypt.hash('Member@123', 10);

    const admin   = await prisma.user.create({ data: { name: 'Admin User',    email: 'admin@workzen.com',   password: adminPwd,  role: 'ADMIN'  } });
    const alice   = await prisma.user.create({ data: { name: 'Alice Johnson', email: 'alice@workzen.com',   password: memberPwd, role: 'MEMBER' } });
    const bob     = await prisma.user.create({ data: { name: 'Bob Smith',     email: 'bob@workzen.com',     password: memberPwd, role: 'MEMBER' } });
    const charlie = await prisma.user.create({ data: { name: 'Charlie Brown', email: 'charlie@workzen.com', password: memberPwd, role: 'MEMBER' } });

    const websiteProject = await prisma.project.create({
      data: { name: 'Website Redesign', description: 'Complete overhaul of the company marketing website', status: 'ACTIVE', createdById: admin.id, deadline: new Date(Date.now() + 30*24*60*60*1000) },
    });
    const mobileProject = await prisma.project.create({
      data: { name: 'Mobile App MVP', description: 'Build and release the first version of the mobile app', status: 'ACTIVE', createdById: admin.id, deadline: new Date(Date.now() + 60*24*60*60*1000) },
    });

    await prisma.projectMember.createMany({
      data: [
        { projectId: websiteProject.id, userId: admin.id },
        { projectId: websiteProject.id, userId: alice.id },
        { projectId: websiteProject.id, userId: bob.id },
        { projectId: mobileProject.id,  userId: admin.id },
        { projectId: mobileProject.id,  userId: charlie.id },
        { projectId: mobileProject.id,  userId: alice.id },
      ],
    });

    const now = new Date();
    const past   = (d) => new Date(now.getTime() - d*86400000);
    const future = (d) => new Date(now.getTime() + d*86400000);

    const t1 = await prisma.task.create({ data: { title: 'Design homepage mockups in Figma', description: 'Create responsive mockups for desktop and mobile', priority: 'HIGH', status: 'DONE', projectId: websiteProject.id, assignedToId: alice.id, createdById: admin.id, dueDate: past(3) } });
    const t2 = await prisma.task.create({ data: { title: 'Implement responsive navigation menu', description: 'Build sticky header with mobile hamburger menu', priority: 'MEDIUM', status: 'IN_PROGRESS', projectId: websiteProject.id, assignedToId: bob.id, createdById: admin.id, dueDate: future(5) } });
    const t3 = await prisma.task.create({ data: { title: 'Write content for About page', description: 'Draft copy for team bios and company mission', priority: 'LOW', status: 'TODO', projectId: websiteProject.id, assignedToId: alice.id, createdById: admin.id, dueDate: future(14) } });
    const t4 = await prisma.task.create({ data: { title: 'Fix broken contact form validation', description: 'Email validation regex is incorrect', priority: 'CRITICAL', status: 'TODO', projectId: websiteProject.id, assignedToId: bob.id, createdById: admin.id, dueDate: past(5) } });
    const t5 = await prisma.task.create({ data: { title: 'Setup PostgreSQL schema with Prisma', description: 'Initialize database and run first migration', priority: 'CRITICAL', status: 'DONE', projectId: mobileProject.id, assignedToId: charlie.id, createdById: admin.id, dueDate: past(2) } });
    const t6 = await prisma.task.create({ data: { title: 'Build authentication API endpoints', description: 'JWT-based signup/login with bcrypt', priority: 'HIGH', status: 'REVIEW', projectId: mobileProject.id, assignedToId: charlie.id, createdById: admin.id, dueDate: future(3) } });
    const t7 = await prisma.task.create({ data: { title: 'Design app onboarding screens', description: 'Create 4 onboarding screens with illustrations', priority: 'MEDIUM', status: 'IN_PROGRESS', projectId: mobileProject.id, assignedToId: alice.id, createdById: admin.id, dueDate: future(7) } });
    const t8 = await prisma.task.create({ data: { title: 'Integrate push notification service', description: 'Setup Firebase Cloud Messaging', priority: 'HIGH', status: 'TODO', projectId: mobileProject.id, assignedToId: charlie.id, createdById: admin.id, dueDate: past(7) } });

    await prisma.comment.createMany({
      data: [
        { content: 'Mockups are done! Figma link shared in Slack.', taskId: t1.id, userId: alice.id },
        { content: 'Looks great! Approved for development.', taskId: t1.id, userId: admin.id },
        { content: 'Working on mobile breakpoints, should be done by EOD.', taskId: t2.id, userId: bob.id },
        { content: 'This is CRITICAL — blocking our SEO campaign launch!', taskId: t4.id, userId: admin.id },
        { content: 'Schema is finalized and migration is applied.', taskId: t5.id, userId: charlie.id },
        { content: 'Please review before I move to Done.', taskId: t6.id, userId: charlie.id },
      ],
    });

    await prisma.activityLog.createMany({
      data: [
        { action: 'PROJECT_CREATED', entityType: 'PROJECT', entityId: websiteProject.id, userId: admin.id, metadata: { name: websiteProject.name } },
        { action: 'PROJECT_CREATED', entityType: 'PROJECT', entityId: mobileProject.id,  userId: admin.id, metadata: { name: mobileProject.name } },
        { action: 'TASK_CREATED',    entityType: 'TASK',    entityId: t1.id, userId: admin.id, metadata: { title: t1.title } },
        { action: 'STATUS_CHANGED',  entityType: 'TASK',    entityId: t1.id, userId: alice.id, metadata: { from: 'TODO', to: 'DONE', title: t1.title } },
        { action: 'STATUS_CHANGED',  entityType: 'TASK',    entityId: t5.id, userId: charlie.id, metadata: { from: 'TODO', to: 'DONE', title: t5.title } },
        { action: 'MEMBER_ADDED',    entityType: 'PROJECT', entityId: websiteProject.id, userId: admin.id, metadata: { addedUser: alice.name } },
      ],
    });

    res.json({
      success: true,
      message: '🎉 Database seeded successfully!',
      credentials: {
        admin:   { email: 'admin@workzen.com',   password: 'Admin@123' },
        alice:   { email: 'alice@workzen.com',   password: 'Member@123' },
        bob:     { email: 'bob@workzen.com',     password: 'Member@123' },
        charlie: { email: 'charlie@workzen.com', password: 'Member@123' },
      }
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await prisma.$disconnect();
  }
});

module.exports = router;
