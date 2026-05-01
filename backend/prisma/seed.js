require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── Wipe existing data (order matters for FK constraints) ───
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared existing data');

  // ─── Create Users ───
  const adminPwd    = await bcrypt.hash('Admin@123', 10);
  const memberPwd   = await bcrypt.hash('Member@123', 10);

  const admin = await prisma.user.create({
    data: { name: 'Admin User',    email: 'admin@taskmanager.com',   password: adminPwd,  role: 'ADMIN' },
  });
  const alice = await prisma.user.create({
    data: { name: 'Alice Johnson', email: 'alice@taskmanager.com',   password: memberPwd, role: 'MEMBER' },
  });
  const bob = await prisma.user.create({
    data: { name: 'Bob Smith',     email: 'bob@taskmanager.com',     password: memberPwd, role: 'MEMBER' },
  });
  const charlie = await prisma.user.create({
    data: { name: 'Charlie Brown', email: 'charlie@taskmanager.com', password: memberPwd, role: 'MEMBER' },
  });
  console.log('✅ Created 4 users');

  // ─── Create Projects ───
  const websiteProject = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of the company marketing website with modern design',
      status: 'ACTIVE',
      createdById: admin.id,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  const mobileProject = await prisma.project.create({
    data: {
      name: 'Mobile App MVP',
      description: 'Build and release the first version of the mobile app',
      status: 'ACTIVE',
      createdById: admin.id,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
  });
  console.log('✅ Created 2 projects');

  // ─── Add Members to Projects ───
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
  console.log('✅ Assigned members to projects');

  // ─── Create Tasks ───
  const now = new Date();
  const past = (days) => new Date(now.getTime() - days * 86400000);
  const future = (days) => new Date(now.getTime() + days * 86400000);

  const t1 = await prisma.task.create({
    data: {
      title: 'Design homepage mockups in Figma',
      description: 'Create responsive mockups for desktop and mobile views',
      priority: 'HIGH',
      status: 'DONE',
      projectId: websiteProject.id,
      assignedToId: alice.id,
      createdById: admin.id,
      dueDate: past(3),
    },
  });

  const t2 = await prisma.task.create({
    data: {
      title: 'Implement responsive navigation menu',
      description: 'Build sticky header with mobile hamburger menu',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      projectId: websiteProject.id,
      assignedToId: bob.id,
      createdById: admin.id,
      dueDate: future(5),
    },
  });

  const t3 = await prisma.task.create({
    data: {
      title: 'Write content for About page',
      description: 'Draft copy for team bios and company mission',
      priority: 'LOW',
      status: 'TODO',
      projectId: websiteProject.id,
      assignedToId: alice.id,
      createdById: admin.id,
      dueDate: future(14),
    },
  });

  // OVERDUE — past due date, not DONE
  const t4 = await prisma.task.create({
    data: {
      title: 'Fix broken contact form validation',
      description: 'Email validation regex is incorrect, causing form submission failures',
      priority: 'CRITICAL',
      status: 'TODO',
      projectId: websiteProject.id,
      assignedToId: bob.id,
      createdById: admin.id,
      dueDate: past(5), // Overdue
    },
  });

  const t5 = await prisma.task.create({
    data: {
      title: 'Setup PostgreSQL schema with Prisma',
      description: 'Initialize database and run first migration',
      priority: 'CRITICAL',
      status: 'DONE',
      projectId: mobileProject.id,
      assignedToId: charlie.id,
      createdById: admin.id,
      dueDate: past(2),
    },
  });

  const t6 = await prisma.task.create({
    data: {
      title: 'Build authentication API endpoints',
      description: 'JWT-based signup/login with bcrypt password hashing',
      priority: 'HIGH',
      status: 'REVIEW',
      projectId: mobileProject.id,
      assignedToId: charlie.id,
      createdById: admin.id,
      dueDate: future(3),
    },
  });

  const t7 = await prisma.task.create({
    data: {
      title: 'Design app onboarding screens',
      description: 'Create 4 onboarding screens with illustrations',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      projectId: mobileProject.id,
      assignedToId: alice.id,
      createdById: admin.id,
      dueDate: future(7),
    },
  });

  // OVERDUE
  const t8 = await prisma.task.create({
    data: {
      title: 'Integrate push notification service',
      description: 'Setup Firebase Cloud Messaging for iOS and Android',
      priority: 'HIGH',
      status: 'TODO',
      projectId: mobileProject.id,
      assignedToId: charlie.id,
      createdById: admin.id,
      dueDate: past(7), // Overdue
    },
  });

  const t9 = await prisma.task.create({
    data: {
      title: 'Write API documentation',
      description: 'Document all REST endpoints using Swagger/OpenAPI',
      priority: 'LOW',
      status: 'TODO',
      projectId: mobileProject.id,
      assignedToId: admin.id,
      createdById: admin.id,
      dueDate: future(20),
    },
  });

  const t10 = await prisma.task.create({
    data: {
      title: 'Conduct cross-browser testing',
      description: 'Test on Chrome, Firefox, Safari, and Edge',
      priority: 'MEDIUM',
      status: 'TODO',
      projectId: websiteProject.id,
      assignedToId: bob.id,
      createdById: admin.id,
      dueDate: future(10),
    },
  });
  console.log('✅ Created 10 tasks');

  // ─── Comments ───
  await prisma.comment.createMany({
    data: [
      { content: 'Mockups are done! Figma link shared in Slack.', taskId: t1.id, userId: alice.id },
      { content: 'Looks great! Approved for development.', taskId: t1.id, userId: admin.id },
      { content: 'Working on mobile breakpoints, should be done by EOD.', taskId: t2.id, userId: bob.id },
      { content: 'This is CRITICAL — blocking our SEO campaign launch!', taskId: t4.id, userId: admin.id },
      { content: 'Schema is finalized and migration is applied.', taskId: t5.id, userId: charlie.id },
      { content: 'JWT expiry and refresh token logic still needs review.', taskId: t6.id, userId: charlie.id },
      { content: 'Please review before I move to Done.', taskId: t6.id, userId: charlie.id },
    ],
  });
  console.log('✅ Created comments');

  // ─── Activity Logs ───
  const activities = [
    { action: 'PROJECT_CREATED', entityType: 'PROJECT', entityId: websiteProject.id, userId: admin.id, metadata: { name: websiteProject.name } },
    { action: 'PROJECT_CREATED', entityType: 'PROJECT', entityId: mobileProject.id,  userId: admin.id, metadata: { name: mobileProject.name } },
    { action: 'TASK_CREATED',    entityType: 'TASK',    entityId: t1.id,              userId: admin.id, metadata: { title: t1.title } },
    { action: 'TASK_CREATED',    entityType: 'TASK',    entityId: t2.id,              userId: admin.id, metadata: { title: t2.title } },
    { action: 'STATUS_CHANGED',  entityType: 'TASK',    entityId: t1.id,              userId: alice.id, metadata: { from: 'TODO', to: 'DONE', title: t1.title } },
    { action: 'STATUS_CHANGED',  entityType: 'TASK',    entityId: t5.id,              userId: charlie.id, metadata: { from: 'TODO', to: 'DONE', title: t5.title } },
    { action: 'TASK_CREATED',    entityType: 'TASK',    entityId: t6.id,              userId: admin.id, metadata: { title: t6.title } },
    { action: 'STATUS_CHANGED',  entityType: 'TASK',    entityId: t6.id,              userId: charlie.id, metadata: { from: 'IN_PROGRESS', to: 'REVIEW', title: t6.title } },
    { action: 'MEMBER_ADDED',    entityType: 'PROJECT', entityId: websiteProject.id,  userId: admin.id, metadata: { addedUser: alice.name } },
    { action: 'COMMENT_ADDED',   entityType: 'TASK',    entityId: t1.id,              userId: alice.id, metadata: { preview: 'Mockups are done!' } },
  ];

  for (const log of activities) {
    await prisma.activityLog.create({ data: log });
  }
  console.log('✅ Created activity logs');

  console.log('\n🎉 Seed complete!');
  console.log('──────────────────────────────');
  console.log('Demo Credentials:');
  console.log('  Admin:   admin@taskmanager.com   / Admin@123');
  console.log('  Alice:   alice@taskmanager.com   / Member@123');
  console.log('  Bob:     bob@taskmanager.com     / Member@123');
  console.log('  Charlie: charlie@taskmanager.com / Member@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
