const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- CHECKING EXISTING USERS ---');
  const existingUsers = await prisma.user.findMany();
  console.log('Current Staff/Admin Users count:', existingUsers.length);
  for (const u of existingUsers) {
    console.log(`- [${u.role}] ${u.name} <${u.email}> (Active: ${u.isActive})`);
  }

  const existingCustomers = await prisma.customer.findMany();
  console.log('Current Customers count:', existingCustomers.length);
  for (const c of existingCustomers) {
    console.log(`- [CUSTOMER] ${c.name} <${c.email}> (Phone: ${c.phone})`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
