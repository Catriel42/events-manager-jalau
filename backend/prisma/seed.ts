import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting custom seeding for date grouping verification...');

  // Clean database
  await prisma.notificationLog.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event_tags.deleteMany();
  await prisma.event.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleaned.');

  // Create test user Catriel Dev
  const user = await prisma.user.create({
    data: {
      full_name: 'Catriel Dev',
      email: 'catriel@jala.university',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Catriel',
      role: 'admin',
    },
  });

  console.log('Test user created.');

  // Create Tags
  const tagTech = await prisma.tag.create({ data: { name: 'Technology', slug: 'tech' } });
  const tagDesign = await prisma.tag.create({ data: { name: 'Design', slug: 'design' } });
  const tagSoftSkills = await prisma.tag.create({ data: { name: 'Soft Skills', slug: 'soft-skills' } });

  console.log('Tags created.');

  const baseDate = new Date(); // Use current system date to ensure it is always "Today"

  // Only one event for today
  const topics = [
    { title: "Angular 18 Reactive Form Patterns", desc: "A workshop on form building.", offsetHours: 0, status: "published", tag: tagTech.id }
  ];

  console.log(`Generating ${topics.length} events...`);

  for (let idx = 0; idx < topics.length; idx++) {
    const topic = topics[idx];
    const startsAt = new Date(baseDate.getTime() + topic.offsetHours * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const eventType = 'virtual';
    const location = null;
    const meetingUrl = 'https://meet.google.com/meet-link-0';

    const event = await prisma.event.create({
      data: {
        title: topic.title,
        description: topic.desc,
        event_type: eventType,
        status: topic.status as any,
        location,
        meeting_url: meetingUrl,
        starts_at: startsAt,
        ends_at: endsAt,
        capacity: 100,
        calendar_uid: `grouping-seed-${idx}@jala.u`,
        tags: {
          create: [{ tag_id: topic.tag }],
        },
      },
    });

    // Register user to this event
    await prisma.registration.create({
      data: {
        event_id: event.id,
        user_id: user.id,
        status: 'confirmed',
      },
    });
  }

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
