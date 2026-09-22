const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: { subcategories: true }
  });
  console.log("Total Categories:", categories.length);
  for (const cat of categories) {
    console.log(`- Category: [${cat.slug}] ${cat.name} (id: ${cat.id})`);
    for (const sub of cat.subcategories) {
      console.log(`    * Subcategory: [${sub.slug}] ${sub.name}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
