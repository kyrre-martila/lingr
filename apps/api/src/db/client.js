import { PrismaClient } from '@prisma/client'

let prisma

export const getDbClient = () => {
  if (!prisma) {
    prisma = new PrismaClient()
  }

  return prisma
}
