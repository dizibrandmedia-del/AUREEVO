const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({ take: 3 });
  if (orders.length === 0) {
    console.log("No orders found to attach returns.");
    return;
  }

  // Clear existing return requests
  await prisma.returnRequest.deleteMany();

  const sampleReturns = [
    {
      orderId: orders[0].id,
      customerId: orders[0].customerId,
      productId: "PROD-SAMPLE-1",
      type: "REPLACEMENT",
      reason: "Display panel hairline scratch upon unboxing",
      description: "Customer reported hairline scratch on the front bezel of the 65-inch OLED TV upon delivery unboxing. Unboxing video submitted.",
      status: "UNDER_REVIEW",
      adminNotes: "Requested technician visit from Sony authorized center to assess panel.",
    },
    {
      orderId: orders[0].id,
      customerId: orders[0].customerId,
      productId: "PROD-SAMPLE-2",
      type: "WARRANTY",
      reason: "Motor heating issue in washing machine",
      description: "Front load washing machine stops mid-cycle after 25 minutes. Error code E04 displayed.",
      status: "APPROVED",
      adminNotes: "Approved for on-site motor inspection by Bosch certified franchise technician.",
    },
  ];

  if (orders.length > 1) {
    sampleReturns.push({
      orderId: orders[1].id,
      customerId: orders[1].customerId,
      productId: "PROD-SAMPLE-3",
      type: "RETURN",
      reason: "Size does not fit living room alcove",
      description: "The double-door refrigerator height is 2 inches taller than the kitchen cabinet enclosure space.",
      status: "PICKUP_SCHEDULED",
      adminNotes: "Reverse pickup scheduled with Gati KWE cargo logistics. AWB #9482910.",
    });
  }

  for (const item of sampleReturns) {
    await prisma.returnRequest.create({ data: item });
  }

  console.log(`Seeded ${sampleReturns.length} return requests successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
