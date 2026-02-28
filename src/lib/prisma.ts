//we create a prisma.ts to solve the issue of 'exhaustion' where a connection pool is created any time you use it in different api route, also 'exhaustion' could be brought about by nextjs hot reloads for each module that is saved then it reloads creating new connection
//hence prisma.ts a shared instance of the prisma client, one pool of connections reused in all routes
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
//globalThis stores the instance on the global object so hot reloads reuse it instead of creating a new one