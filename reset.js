const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    await prisma.requirement.updateMany({
        data: { status: 'PENDING' }
    });
    console.log('Todos los requisitos se reiniciaron a Pendiente.');
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });
