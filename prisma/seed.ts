import { prisma } from "../src/lib/prisma";
import { hash } from 'bcryptjs'

async function main() {
  const hashedPasswords = await hash('password234', 10)

  const alice = await prisma.user.upsert({
    where: { email: 'alice@gmail.com' },
    update: { password: hashedPasswords },
    create: {
      name: 'Alice',
      phone: '0712345678',
      email: 'alice@gmail.com',
      password: hashedPasswords,
      role: 'OWNER'
    }
  })

  const hashedpass = await hash('pass234', 10)
  await prisma.user.upsert({
    where: { email: 'mac@gmail.com'},
    update: {password: hashedpass},
    create: {
      name: 'Mac',
      phone: '0787654321',
      email: 'mac@gmail.com',
      password: hashedpass,
      role: 'BORROWER'
    }
  })

  await prisma.item.upsert({
    where: { id: 1 },
    update: {},
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