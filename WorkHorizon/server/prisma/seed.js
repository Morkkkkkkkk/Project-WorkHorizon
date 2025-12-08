// prisma/seed.js
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { fakerTH, faker } from "@faker-js/faker"; // Use Thai locale where appropriate

const prisma = new PrismaClient();

// --- Helper Functions ---
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomElements = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper สำหรับ placeholder avatar ตาม role
const placeholderAvatar = (name, role) => {
  let color = "6C757D"; // default gray
  switch (role) {
    case "SUPER_ADMIN":
      color = "000000"; // black
      break;
    case "EMPLOYER":
      color = "007BFF"; // blue
      break;
    case "FREELANCER":
      color = "28A745"; // green
      break;
    case "JOB_SEEKER":
      color = "6C757D"; // gray
      break;
  }
  return `https://placehold.co/150x150/${color}/ffffff?text=${name.charAt(0)}`;
};

async function clearAll() {
  console.log("🧹 ล้างข้อมูลเก่า... (ตามลำดับ child -> parent)");
  // ลบ child tables ก่อน
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.serviceConversation.deleteMany();
  await prisma.freelancerReview.deleteMany();
  await prisma.freelancerWork.deleteMany();
  await prisma.applicantRating.deleteMany();
  await prisma.internalNote.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.jobImage.deleteMany();
  await prisma.job.deleteMany();
  await prisma.service.deleteMany();
  await prisma.freelancerProfile.deleteMany();
  await prisma.company.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.user.deleteMany();

  // Master data
  await prisma.subCategory.deleteMany();
  await prisma.mainCategory.deleteMany();
  await prisma.jobType.deleteMany();
  await prisma.district.deleteMany();
  await prisma.province.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.industry.deleteMany();
  await prisma.advertisement.deleteMany();
  await prisma.featuredSection.deleteMany();
}

async function seed() {
  console.log("🌱 เริ่มใส่ข้อมูลใหม่...");

  // --- 0. Password Hash ---
  const passwordHash = await bcrypt.hash("password123", 10);

  // --- 1. Master Data ---
  console.log("Creating Master Data...");

  // 1.1 Industries
  const industryNames = [
    "เทคโนโลยีสารสนเทศ (IT)",
    "การตลาดและโฆษณา",
    "การเงินและการธนาคาร",
    "อสังหาริมทรัพย์",
    "การผลิตและอุตสาหกรรม",
    "การท่องเที่ยวและโรงแรม",
    "การศึกษา",
    "สุขภาพและการแพทย์",
    "ขนส่งและโลจิสติกส์",
    "ค้าปลีกและอีคอมเมิร์ซ",
  ];
  const industries = await Promise.all(
    industryNames.map((name) => prisma.industry.create({ data: { name } }))
  );

  // 1.2 Job Types
  const jobTypeNames = [
    "Full-Time",
    "Part-Time",
    "Contract",
    "Freelance",
    "Internship",
  ];
  const jobTypes = await Promise.all(
    jobTypeNames.map((name) => prisma.jobType.create({ data: { name } }))
  );

  // 1.3 Skills
  const skillNames = [
    "React",
    "Node.js",
    "Python",
    "Java",
    "SQL",
    "Excel",
    "Photoshop",
    "Illustrator",
    "Digital Marketing",
    "SEO",
    "English Communication",
    "Project Management",
    "Sales",
    "Customer Service",
    "Accounting",
    "HR Management",
  ];
  const skills = await Promise.all(
    skillNames.map((name) => prisma.skill.create({ data: { name } }))
  );

  // 1.4 Provinces & Districts (Top 5 Provinces)
  const provincesData = [
    {
      name: "กรุงเทพมหานคร",
      districts: ["ปทุมวัน", "จตุจักร", "บางรัก", "สาทร", "ลาดพร้าว", "พญาไท"],
    },
    {
      name: "เชียงใหม่",
      districts: ["เมืองเชียงใหม่", "หางดง", "สันทราย", "แม่ริม"],
    },
    {
      name: "ชลบุรี",
      districts: ["เมืองชลบุรี", "บางละมุง", "ศรีราชา", "สัตหีบ"],
    },
    { name: "ภูเก็ต", districts: ["เมืองภูเก็ต", "กะทู้", "ถลาง"] },
    { name: "ขอนแก่น", districts: ["เมืองขอนแก่น", "บ้านไผ่", "ชุมแพ"] },
  ];

  const provinces = [];
  for (const p of provincesData) {
    const province = await prisma.province.create({
      data: {
        name: p.name,
        districts: { create: p.districts.map((name) => ({ name })) },
      },
      include: { districts: true },
    });
    provinces.push(province);
  }

  // 1.5 Categories (Main & Sub)
  const categoriesData = [
    {
      name: "เทคโนโลยี / IT",
      subs: [
        "Web Developer",
        "Mobile Developer",
        "Software Engineer",
        "System Analyst",
        "IT Support",
        "Data Scientist",
        "DevOps",
      ],
    },
    {
      name: "การตลาด / โฆษณา",
      subs: [
        "Digital Marketing",
        "Content Creator",
        "SEO Specialist",
        "Social Media Admin",
        "Marketing Manager",
      ],
    },
    {
      name: "ออกแบบ / กราฟิก",
      subs: [
        "Graphic Designer",
        "UX/UI Designer",
        "Video Editor",
        "Animator",
        "Interior Designer",
      ],
    },
    {
      name: "บัญชี / การเงิน",
      subs: ["Accountant", "Financial Analyst", "Auditor", "Tax Consultant"],
    },
    {
      name: "งานขาย / บริการลูกค้า",
      subs: [
        "Sales Representative",
        "Customer Service",
        "Telesales",
        "Account Executive",
      ],
    },
    {
      name: "ธุรการ / HR",
      subs: ["HR Officer", "Recruiter", "Admin Staff", "Secretary"],
    },
    {
      name: "วิศวกรรม",
      subs: [
        "Civil Engineer",
        "Mechanical Engineer",
        "Electrical Engineer",
        "Industrial Engineer",
      ],
    },
  ];

  const mainCategories = [];
  for (const c of categoriesData) {
    const mainCat = await prisma.mainCategory.create({
      data: { name: c.name },
    });
    mainCategories.push(mainCat);

    for (const subName of c.subs) {
      await prisma.subCategory.create({
        data: { name: subName, mainCategoryId: mainCat.id },
      });
    }
  }

  // Reload categories with subs
  const allMainCategories = await prisma.mainCategory.findMany({
    include: { subCategorys: true },
  });

  // --- 2. Users ---
  console.log("Creating Users...");

  // 2.1 Admin
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: passwordHash,
      role: "SUPER_ADMIN",
      firstName: "Admin",
      lastName: "System",
      phone: "0000000000",
      status: "ACTIVE",
    },
  });

  // 2.2 Employers (20 users)
  const employers = [];
  for (let i = 0; i < 20; i++) {
    const companyName = faker.company.name();
    // 1. สร้างชื่อเก็บไว้ในตัวแปรก่อน
    const fName = fakerTH.person.firstName();
    const lName = fakerTH.person.lastName();

    const employer = await prisma.user.create({
      data: {
        email: `employer${i + 1}@example.com`,
        password: passwordHash,
        role: "EMPLOYER",
        firstName: fName, // 2. ใช้ตัวแปรที่สร้างไว้
        lastName: lName,
        phone: faker.phone.number(),
        status: "ACTIVE",
        // 3. ส่งตัวแปร fName ไปที่ฟังก์ชัน placeholderAvatar
        profileImageUrl: placeholderAvatar(fName, "EMPLOYER"), 
        company: {
          create: {
            companyName: companyName,
            description: faker.lorem.paragraph(),
            industryId: randomElement(industries).id,
            isVerified: Math.random() > 0.3,
            companySize: randomElement([
              "1-10", "11-50", "51-200", "201-500", "500+",
            ]),
            address: fakerTH.location.streetAddress(),
            website: faker.internet.url(),
            logoUrl: `https://placehold.co/200x200/FF9800/FFFFFF?text=${companyName.charAt(0)}`,
          },
        },
      },
      include: { company: true },
    });
    employers.push(employer);
  }

  // 2.3 Freelancers (20 users)
  const freelancers = [];
  for (let i = 0; i < 20; i++) {
    // 1. สร้างชื่อเก็บไว้ก่อน
    const fName = fakerTH.person.firstName();
    const lName = fakerTH.person.lastName();

    const freelancer = await prisma.user.create({
      data: {
        email: `freelancer${i + 1}@example.com`,
        password: passwordHash,
        role: "FREELANCER",
        firstName: fName, // 2. ใช้ตัวแปร
        lastName: lName,
        phone: faker.phone.number(),
        status: "ACTIVE",
        // 3. ใส่รูป
        profileImageUrl: placeholderAvatar(fName, "FREELANCER"),
        bio: faker.lorem.sentence(),
        freelancerProfile: {
          create: {
            professionalTitle: faker.person.jobTitle(),
            bio: faker.lorem.paragraphs(2),
            hourlyRate: faker.commerce.price({ min: 300, max: 3000 }),
            yearsOfExperience: randomInt(1, 10),
            isVerified: Math.random() > 0.2,
            portfolioUrl: faker.internet.url(),
          },
        },
        skills: {
          connect: randomElements(skills, randomInt(2, 5)).map((s) => ({
            id: s.id,
          })),
        },
      },
      include: { freelancerProfile: true },
    });
    freelancers.push(freelancer);

    // Create 1-3 Services for each freelancer
    const numServices = randomInt(1, 3);
    for (let j = 0; j < numServices; j++) {
      const mainCat = randomElement(allMainCategories);
      await prisma.service.create({
        data: {
          title: `รับทำ ${mainCat.name} - ${faker.lorem.words(3)}`,
          description: faker.lorem.paragraph(),
          price: faker.commerce.price({ min: 500, max: 10000 }),
          freelancerId: freelancer.id,
          mainCategoryId: mainCat.id,
          isActive: true,
          coverImage: `https://placehold.co/600x400/orange/white?text=Service+${
            j + 1
          }`,
        },
      });
    }
  }

  // 2.4 Job Seekers (50 users)
  const seekers = [];
  for (let i = 0; i < 50; i++) {
    // 1. สร้างชื่อเก็บไว้ก่อน
    const fName = fakerTH.person.firstName();
    const lName = fakerTH.person.lastName();

    const seeker = await prisma.user.create({
      data: {
        email: `seeker${i + 1}@example.com`,
        password: passwordHash,
        role: "JOB_SEEKER",
        firstName: fName, // 2. ใช้ตัวแปร
        lastName: lName,
        phone: faker.phone.number(),
        status: "ACTIVE",
        // 3. ใส่รูป
        profileImageUrl: placeholderAvatar(fName, "JOB_SEEKER"),
        bio: faker.lorem.sentence(),
        skills: {
          connect: randomElements(skills, randomInt(2, 5)).map((s) => ({
            id: s.id,
          })),
        },
      },
    });
    seekers.push(seeker);
  }

  // --- 3. Jobs ---
  console.log("Creating Jobs...");
  const jobs = [];
  for (let i = 0; i < 200; i++) {
    const employer = randomElement(employers);
    const mainCat = randomElement(allMainCategories);
    const subCat = randomElement(mainCat.subCategorys);
    const province = randomElement(provinces);
    const district = randomElement(province.districts);
    const jobType = randomElement(jobTypes);

    const jobStatus =
      Math.random() > 0.1
        ? "PUBLISHED"
        : Math.random() > 0.5
        ? "DRAFT"
        : "FILLED";

    const job = await prisma.job.create({
      data: {
        title: `${subCat.name} (${faker.lorem.word()})`,
        description: faker.lorem.paragraphs(3),
        responsibilities: faker.lorem.paragraphs(2),
        benefits: faker.lorem.paragraphs(1),
        workingHours: "Mon-Fri, 9:00 - 18:00",
        location: `${district.name}, ${province.name}`,
        salaryMin: faker.commerce.price({ min: 15000, max: 30000 }),
        salaryMax: faker.commerce.price({ min: 35000, max: 80000 }),
        isSalaryNegotiable: Math.random() > 0.5,
        status: jobStatus,
        companyId: employer.company.id,
        mainCategoryId: mainCat.id,
        subCategoryId: subCat.id,
        jobTypeId: jobType.id,
        provinceId: province.id,
        districtId: district.id,
        requiredSkills: {
          connect: randomElements(skills, randomInt(1, 3)).map((s) => ({
            id: s.id,
          })),
        },
        createdAt: faker.date.past(),
      },
    });
    jobs.push(job);
  }

  // --- 4. Applications ---
  console.log("Creating Applications...");
  for (const job of jobs) {
    if (job.status === "DRAFT") continue;

    // 0-5 applicants per job
    const numApplicants = randomInt(0, 5);
    const applicants = randomElements(seekers, numApplicants);

    for (const applicant of applicants) {
      const status = randomElement([
        "PENDING",
        "REVIEWED",
        "SHORTLISTED",
        "REJECTED",
      ]);
      await prisma.application.create({
        data: {
          jobId: job.id,
          userId: applicant.id,
          status: status,
          coverLetter: faker.lorem.paragraph(),
          appliedAt: faker.date.recent(),
        },
      });
    }
  }

  // --- 5. Freelancer Works (Completed & Reviews) ---
  console.log("Creating Freelancer Works...");
  for (const freelancer of freelancers) {
    // 0-3 completed works per freelancer
    const numWorks = randomInt(0, 3);
    const clients = randomElements(seekers, numWorks);

    for (const client of clients) {
      await prisma.freelancerWork.create({
        data: {
          freelancerId: freelancer.id,
          freelancerProfileId: freelancer.freelancerProfile.id,
          jobSeekerId: client.id,
          jobTitle: faker.person.jobTitle(),
          description: faker.lorem.sentence(),
          status: "COMPLETED",
          completedAt: faker.date.recent(),
          price: faker.commerce.price({ min: 1000, max: 5000 }),
          review: {
            create: {
              rating: randomInt(3, 5),
              comment: faker.lorem.sentence(),
              reviewerId: client.id,
              reviewedId: freelancer.id,
              freelancerProfileId: freelancer.freelancerProfile.id,
            },
          },
        },
      });
    }
  }

  console.log("✨ Seeding completed successfully!");
  console.log("-----------------------------------");
  console.log("🔑 Default Password: password123");
  console.log("-----------------------------------");
}

async function main() {
  try {
    await clearAll();
    await seed();
  } catch (e) {
    console.error("*** ERROR during seed:");

    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("PrismaClientKnownRequestError:", e.code);
      console.error("Message:", e.message);
      console.error("Meta:", e.meta);
    } else if (e instanceof Prisma.PrismaClientValidationError) {
      console.error("PrismaClientValidationError:", e.message);
    } else {
      console.error(e);
    }

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();

