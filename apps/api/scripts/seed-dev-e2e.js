import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_COUNTRY = { isoCode: 'NO', name: 'Norway', enabled: true }
const DEFAULT_REGION = {
  slug: 'trondelag',
  name: 'Trøndelag',
  launchStatus: 'open',
  isOpen: true
}

const run = async () => {
  const country = await prisma.country.upsert({
    where: { isoCode: DEFAULT_COUNTRY.isoCode },
    update: { name: DEFAULT_COUNTRY.name, enabled: true },
    create: DEFAULT_COUNTRY
  })

  await prisma.region.upsert({
    where: { countryId_slug: { countryId: country.id, slug: DEFAULT_REGION.slug } },
    update: {
      name: DEFAULT_REGION.name,
      launchStatus: DEFAULT_REGION.launchStatus,
      isOpen: DEFAULT_REGION.isOpen
    },
    create: {
      countryId: country.id,
      slug: DEFAULT_REGION.slug,
      name: DEFAULT_REGION.name,
      launchStatus: DEFAULT_REGION.launchStatus,
      isOpen: DEFAULT_REGION.isOpen
    }
  })

  console.log('Seeded local E2E defaults: country=NO, region=trondelag (open).')
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
