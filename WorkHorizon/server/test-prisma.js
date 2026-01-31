import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking Prisma Client models...");
  if (prisma.contactRequest) {
    console.log("SUCCESS: prisma.contactRequest is defined.");
  } else {
    console.error("ERROR: prisma.contactRequest is UNDEFINED.");
    console.log(
      "Available models:",
      Object.keys(prisma).filter((key) => key[0] !== "_" && key[0] !== "$"),
    );
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
