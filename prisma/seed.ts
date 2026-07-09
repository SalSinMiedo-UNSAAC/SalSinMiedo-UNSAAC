import { PrismaClient, RequirementStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create a user
  const user = await prisma.user.create({
    data: {
      name: 'Viajero Test',
      email: 'viajero@test.com',
    },
  });

  // 2. Create a route
  const route = await prisma.userRoute.create({
    data: {
      userId: user.id,
      origin: 'Perú',
      destination: 'España',
      reason: 'Estudios',
      progress: 68,
    },
  });

  // 3. Create requirements based on the mockup hypothesis
  await prisma.requirement.createMany({
    data: [
      {
        routeId: route.id,
        title: 'Pasaporte vigente',
        source: 'RENIEC / Migraciones Perú',
        status: RequirementStatus.VALIDATED,
        isCritical: true,
      },
      {
        routeId: route.id,
        title: 'Visa de estudiante',
        source: 'Consulado de España en Lima',
        status: RequirementStatus.PENDING,
        isCritical: true,
      },
      {
        routeId: route.id,
        title: 'Seguro médico internacional',
        source: 'Requisito para estancia',
        status: RequirementStatus.IN_REVIEW,
        isCritical: false,
      },
      {
        routeId: route.id,
        title: 'Comprobante de fondos',
        source: 'Medios económicos suficientes',
        status: RequirementStatus.REJECTED,
        isCritical: true,
      },
    ],
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
