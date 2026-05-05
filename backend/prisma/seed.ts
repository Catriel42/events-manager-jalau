import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seeding...');

  await prisma.notificationLog.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event_tags.deleteMany();
  await prisma.event.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleaned.');

  await prisma.user.create({
    data: {
      full_name: 'Catriel Dev',
      email: 'catriel@jala.university',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Catriel',
      role: 'admin',
    },
  });

  console.log('Users created.');

  const tagTech = await prisma.tag.create({
    data: { name: 'Technology', slug: 'tech' },
  });
  const tagJala = await prisma.tag.create({
    data: { name: 'Jala University', slug: 'jala-u' },
  });

  console.log('Tags created.');

  await prisma.event.create({
    data: {
      title: 'Angular v21 Deep Dive',
      description:
        'A comprehensive workshop about the latest Angular features: Signals, Zoneless, and more.',
      location: 'Main Auditorium',
      event_type: 'hybrid',
      status: 'published',
      starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ends_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
      ),
      capacity: 50,
      calendar_uid: 'angular-v21-workshop@jala.u',
      tags: {
        create: [{ tag_id: tagTech.id }, { tag_id: tagJala.id }],
      },
    },
  });

  console.log('Test event created.');
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
