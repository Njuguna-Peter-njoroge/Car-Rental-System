const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Please provide an email address: node delete-user.js <email>');
    process.exit(1);
  }
  
  try {
    console.log(`Deleting user with email: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return;
    }
    
    await prisma.user.delete({
      where: { email }
    });
    
    console.log(`Successfully deleted user: ${user.name} (${email})`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 