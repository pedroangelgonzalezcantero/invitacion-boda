/**
 * prisma/seed.ts
 * ─────────────────────────────────────────────────────────────
 * Seed inicial con invitados de ejemplo.
 * Ejecutar con: npx prisma db seed
 * ─────────────────────────────────────────────────────────────
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding guests...')

  const guests = [
    { name: 'Ana García',        code: 'ANA-001',    maxCompanions: 2, email: 'ana@example.com' },
    { name: 'Carlos Martínez',   code: 'CARLOS-002', maxCompanions: 1, email: 'carlos@example.com' },
    { name: 'Laura y Pedro',     code: 'LAURA-003',  maxCompanions: 3, email: 'laura@example.com' },
    { name: 'Familia Rodríguez', code: 'FAMILIA-004',maxCompanions: 4, email: null },
    { name: 'María López',       code: 'MARIA-005',  maxCompanions: 1, email: 'maria@example.com' },
  ]

  for (const guest of guests) {
    await prisma.guest.upsert({
      where:  { code: guest.code },
      update: {},
      create: guest,
    })
    console.log(`  ✓ ${guest.name} (${guest.code})`)
  }

  console.log('✅ Seed completado.')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

