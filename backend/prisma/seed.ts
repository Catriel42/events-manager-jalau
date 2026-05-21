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

  const tagDesign = await prisma.tag.create({
    data: { name: 'Design', slug: 'design' },
  });

  console.log('Tags created.');

  const eventsData = [
    {
      title: 'Angular v21 Deep Dive',
      desc: 'A comprehensive workshop about the latest Angular features.',
      tag: tagTech.id,
    },
    {
      title: 'React Performance Tuning',
      desc: 'Learn how to optimize your React applications for speed.',
      tag: tagTech.id,
    },
    {
      title: 'NestJS Microservices Masterclass',
      desc: 'Build scalable microservices using NestJS and RabbitMQ.',
      tag: tagTech.id,
    },
    {
      title: 'Jala University Orientation',
      desc: 'Welcome session for all new Jala University students.',
      tag: tagJala.id,
    },
    {
      title: 'Python Data Structures',
      desc: 'Master lists, dictionaries, sets, and tuples in Python.',
      tag: tagTech.id,
    },
    {
      title: 'System Design Interview Prep',
      desc: 'Ace your next big tech company interview with these patterns.',
      tag: tagTech.id,
    },
    {
      title: 'Figma for Developers',
      desc: 'Learn how to extract assets and understand design systems.',
      tag: tagDesign.id,
    },
    {
      title: 'Cyber Security Basics',
      desc: 'Protect your web applications from common vulnerabilities.',
      tag: tagTech.id,
    },
    {
      title: 'AWS Cloud Fundamentals',
      desc: 'Get started with EC2, S3, and Lambda functions.',
      tag: tagTech.id,
    },
    {
      title: 'Advanced Git Workflow',
      desc: 'Rebasing, cherry-picking, and resolving merge conflicts.',
      tag: tagTech.id,
    },
  ];

  console.log('Creating virtual events...');

  for (let i = 0; i < eventsData.length; i++) {
    const event = eventsData[i];
    await prisma.event.create({
      data: {
        title: event.title,
        description: event.desc,
        event_type: 'virtual',
        status: 'published',
        meeting_url: `https://meet.google.com/xyz-abc-00${i}`,
        starts_at: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Empiezan en días consecutivos
        ends_at: new Date(
          Date.now() + (i + 1) * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
        ),
        capacity: 100 + i * 10,
        calendar_uid: `virtual-event-${i}@jala.u`,
        tags: {
          create: [{ tag_id: event.tag }],
        },
      },
    });
  }

  console.log('10 Virtual events created.');
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
