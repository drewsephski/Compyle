import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Seed Achievements
  const achievements = [
    { name: 'First League', description: 'Join your first fantasy league.', icon: '🏆' },
    { name: 'First Win', description: 'Win your first weekly matchup.', icon: '🥇' },
    { name: 'Champion', description: 'Win a fantasy league championship.', icon: '👑' },
    { name: 'Top Analyst', description: 'Have a comment receive 10 likes.', icon: '📈' },
    { name: 'Serial Poster', description: 'Create 10 discussion threads.', icon: '✍️' },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }
  console.log('Seeded achievements.');

  // You can add more seed data here, for example:
  // - Default league rule templates
  // - Test users in a development environment

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });