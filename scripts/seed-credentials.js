const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const accountsToSeed = [
  {
    name: 'Dev SuperAdmin',
    email: 'admin@aureevo.com',
    secondaryEmail: 'admin@aurevo.digital',
    password: 'Admin@12345',
    role: 'SUPER_ADMIN',
    phone: '9839057741'
  },
  {
    name: 'Rohit Operations',
    email: 'manager@aureevo.com',
    secondaryEmail: 'manager@aurevo.digital',
    password: 'Manager@12345',
    role: 'ADMIN_MANAGER',
    phone: '9839057742'
  },
  {
    name: 'Amit Sales',
    email: 'sales@aureevo.com',
    secondaryEmail: 'sales@aurevo.digital',
    password: 'Sales@12345',
    role: 'SALES_MANAGER',
    phone: '9839057743'
  },
  {
    name: 'Neha Listing',
    email: 'listing@aureevo.com',
    secondaryEmail: 'listing@aurevo.digital',
    password: 'Listing@12345',
    role: 'LISTING_EXECUTIVE',
    phone: '9839057744'
  }
];

const customersToSeed = [
  {
    name: 'Rahul Sharma',
    email: 'customer@aureevo.com',
    phone: '9876543211',
    password: 'Customer@12345'
  },
  {
    name: 'Rahul Sharma (Demo)',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    password: 'Customer@12345'
  }
];

async function seed() {
  console.log('--- SEEDING AUTH USERS & PASSWORDS ---');

  for (const acc of accountsToSeed) {
    const passwordHash = await bcrypt.hash(acc.password, 10);

    // Primary email
    await prisma.user.upsert({
      where: { email: acc.email },
      update: {
        name: acc.name,
        passwordHash,
        role: acc.role,
        isActive: true,
        phone: acc.phone
      },
      create: {
        name: acc.name,
        email: acc.email,
        passwordHash,
        role: acc.role,
        isActive: true,
        phone: acc.phone
      }
    });

    // Secondary email (@aurevo.digital)
    await prisma.user.upsert({
      where: { email: acc.secondaryEmail },
      update: {
        name: acc.name,
        passwordHash,
        role: acc.role,
        isActive: true,
        phone: acc.phone
      },
      create: {
        name: acc.name,
        email: acc.secondaryEmail,
        passwordHash,
        role: acc.role,
        isActive: true,
        phone: acc.phone
      }
    });

    console.log(`[USER OK] ${acc.role}: ${acc.email} / ${acc.secondaryEmail} -> ${acc.password}`);
  }

  // Customers
  for (const c of customersToSeed) {
    const passwordHash = await bcrypt.hash(c.password, 10);
    await prisma.customer.upsert({
      where: { email: c.email },
      update: {
        name: c.name,
        passwordHash,
        phone: c.phone,
        isVerified: true
      },
      create: {
        name: c.name,
        email: c.email,
        passwordHash,
        phone: c.phone,
        isVerified: true
      }
    });
    console.log(`[CUSTOMER OK] ${c.name}: ${c.email} -> ${c.password}`);
  }

  console.log('\n--- VERIFYING USER TOTALS ---');
  const totalUsers = await prisma.user.count();
  const totalCustomers = await prisma.customer.count();
  console.log(`Total Users in DB: ${totalUsers}`);
  console.log(`Total Customers in DB: ${totalCustomers}`);
}

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
