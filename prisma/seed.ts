import { prisma } from "../src/lib/prisma";

async function main() {

  const alice = await prisma.user.upsert({
    where: { email: 'alice@gmail.com' },
    update: {},
    create: {
      name: 'Alice',
      phone: '0712345678',
      email: 'alice@gmail.com',
      role: 'OWNER'
    }
  })

  await prisma.user.upsert({
    where: { email: 'mac@gmail.com'},
    update: {},
    create: {
      name: 'Mac',
      phone: '0787654321',
      email: 'mac@gmail.com',
      role: 'BORROWER'
    }
  })

  await prisma.item.upsert({
    where: { id: 1 },
    update: { available: true },
    create: {
      ownerId: alice.id,
      title: 'Electric drill',
      description: 'Good condition, light use'
    }
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())