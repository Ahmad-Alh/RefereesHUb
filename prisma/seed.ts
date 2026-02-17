import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@refereeshub.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2025!'
  const adminName = process.env.ADMIN_NAME || 'Admin'

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (existing) {
    console.log(`Admin user already exists: ${adminEmail}`)
  } else {
    const hashedPassword = await hash(adminPassword, 12)

    await prisma.user.create({
      data: {
        refereeNumber: '0000',
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    console.log(`✅ Admin user created:`)
    console.log(`   Email:    ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   Role:     ADMIN`)
  }

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
