let prisma

export const getDbClient = async () => {
  if (!prisma) {
    const { PrismaClient } = await import('@prisma/client')
    prisma = new PrismaClient()
  }

  return prisma
}
