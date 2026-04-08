require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./utils/prisma');
const { createDefaultWorkflows } = require('./routes/auth.routes');

async function seed() {
  console.log('Seeding database...');

  // Client 1
  const client = await prisma.client.upsert({
    where: { id: 'seed-client-001' },
    update: {},
    create: {
      id: 'seed-client-001',
      name: 'Demo Store',
      businessType: 'ecommerce',
      avgDealValue: 250,
    },
  });

  // Admin user
  const hashed = await bcrypt.hash('demo1234', 12);
  await prisma.clientUser.upsert({
    where: { email: 'admin@demostore.com' },
    update: {},
    create: {
      id: uuidv4(),
      clientId: client.id,
      email: 'admin@demostore.com',
      password: hashed,
      role: 'admin',
    },
  });

  // Check existing workflows
  const wfCount = await prisma.workflow.count({ where: { clientId: client.id } });
  if (wfCount === 0) {
    await createDefaultWorkflows(client.id, 'ecommerce');
    console.log('Created 3 default workflows');
  }

  // 5 leads
  const leadsData = [
    { name: 'Alice Johnson', email: 'alice@example.com', phone: '+15551234567' },
    { name: 'Bob Smith', email: 'bob@example.com', phone: '+15559876543' },
    { name: 'Carol Williams', email: 'carol@example.com', phone: '+15555554321' },
    { name: 'David Brown', email: 'david@example.com', phone: '+15551112233' },
    { name: 'Emma Davis', email: 'emma@example.com', phone: '+15553334455' },
  ];

  for (const lead of leadsData) {
    const existing = await prisma.lead.findFirst({
      where: { clientId: client.id, email: lead.email },
    });
    if (!existing) {
      await prisma.lead.create({
        data: { id: uuidv4(), clientId: client.id, ...lead, metadata: '{}' },
      });
    }
  }

  const counts = await Promise.all([
    prisma.lead.count({ where: { clientId: client.id } }),
    prisma.workflow.count({ where: { clientId: client.id } }),
  ]);

  console.log(`Seed complete:
  - Client: ${client.name} (${client.id})
  - Login: admin@demostore.com / demo1234
  - Leads: ${counts[0]}
  - Workflows: ${counts[1]}`);

  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
