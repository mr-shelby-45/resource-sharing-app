import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.booking.deleteMany()
  await prisma.item.deleteMany()
  await prisma.user.deleteMany()

  await prisma.user.upsert({
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
    update: {phone: '0787654321'},
    create: {
      name: 'Mac',
      phone: '0787654321',
      email: 'mac@gmail.com',
      role: 'BORROWER'
    }
  })

  await prisma.item.create({
    data: {
      ownerId: 1,
      title: 'Electric drill',
      description: 'Good condition, light use'
    }
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())