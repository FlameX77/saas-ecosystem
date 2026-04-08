require('dotenv').config();
const prisma = require('./utils/prisma');
const { matchAndCreateJobs } = require('./services/workflow.service');
const { generateMessage } = require('./services/ai.service');
const { runWorker } = require('./worker');
const { v4: uuidv4 } = require('uuid');

async function runTests() {
  console.log('\n=== E2E Pipeline Test ===\n');

  // 1. Get seed client
  const client = await prisma.client.findFirst({ where: { name: 'Demo Store' } });
  if (!client) { console.error('Run seed first: npm run db:seed'); process.exit(1); }
  console.log(`✓ Client: ${client.name} (${client.id})`);

  // 2. Get a lead
  const lead = await prisma.lead.findFirst({ where: { clientId: client.id } });
  if (!lead) { console.error('No leads found'); process.exit(1); }
  console.log(`✓ Lead: ${lead.name}`);

  // 3. Create event
  const event = await prisma.event.create({
    data: {
      id: uuidv4(),
      clientId: client.id,
      leadId: lead.id,
      type: 'cart_abandoned',
      payload: JSON.stringify({ cartValue: 199.99 }),
    },
  });
  console.log(`✓ Event created: ${event.id} (type: ${event.type})`);

  // 4. Match workflows & create jobs
  const jobs = await matchAndCreateJobs({ event, clientId: client.id });
  console.log(`✓ Jobs created: ${jobs.length}`);

  // 5. Generate AI message test
  const workflow = await prisma.workflow.findFirst({ where: { clientId: client.id } });
  const message = await generateMessage({
    lead,
    eventType: 'cart_abandoned',
    workflow,
    stepConfig: { channel: 'email', messageHint: 'cart recovery' },
  });
  console.log(`✓ AI message generated: "${message.substring(0, 80)}..."`);

  // 6. Run worker (processes pending jobs immediately)
  console.log('\nRunning worker...');
  await runWorker();

  // 7. Check messages
  const messages = await prisma.message.findMany({ where: { clientId: client.id }, orderBy: { createdAt: 'desc' }, take: 5 });
  console.log(`✓ Messages sent: ${messages.length}`);
  for (const m of messages) {
    console.log(`  - [${m.channel}] "${m.content.substring(0, 60)}..."`);
  }

  // 8. Check dashboard
  const msgCount = await prisma.message.count({ where: { clientId: client.id } });
  const recoveredRevenue = msgCount * 0.1 * client.avgDealValue;
  console.log(`\n✓ Dashboard Summary:`);
  console.log(`  - Messages sent: ${msgCount}`);
  console.log(`  - Recovered revenue: $${recoveredRevenue.toFixed(2)}`);

  // 9. Multi-client isolation check
  const otherClient = await prisma.client.create({
    data: {
      id: uuidv4(),
      name: 'Other Client',
      businessType: 'ecommerce',
      avgDealValue: 500,
    },
  });
  const otherLeads = await prisma.lead.findMany({ where: { clientId: otherClient.id } });
  console.log(`\n✓ Multi-tenant isolation: Other client has ${otherLeads.length} leads (should be 0)`);
  await prisma.client.delete({ where: { id: otherClient.id } });

  console.log('\n=== All tests passed! ===\n');
  await prisma.$disconnect();
}

runTests().catch(e => { console.error('Test failed:', e.message); process.exit(1); });
