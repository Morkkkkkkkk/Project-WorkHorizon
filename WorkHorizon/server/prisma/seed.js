// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// --- Helper Functions ---
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- Categories Data ---
const categoriesData = [
  {
    name: "เทคโนโลยี / ไอที",
    subs: ["Web Developer", "Mobile Developer", "Software Engineer", "DevOps", "IT Support"],
  },
  {
    name: "ออกแบบ / กราฟิก",
    subs: ["Graphic Designer", "UX/UI Designer", "Logo Design", "3D Model", "Video Editor"],
  },
  {
    name: "การตลาด / โฆษณา",
    subs: ["Digital Marketing", "SEO Specialist", "Content Writer", "Social Media Admin"],
  },
  {
    name: "แปลภาษา / เขียนบทความ",
    subs: ["Translation (EN-TH)", "Copywriting", "Proofreading", "Technical Writing"],
  },
  {
    name: "ที่ปรึกษา / บัญชี",
    subs: ["Accounting", "Legal Consultant", "Business Plan", "Tax Consultant"],
  },
];

async function clearAll() {
  console.log("🧹 ล้างข้อมูลเก่า...");
  // 1. ลบ Child Tables
  await prisma.service.deleteMany(); // ลบบริการฟรีแลนซ์
  await prisma.job.deleteMany();     // ลบงานบริษัท
  
  // 2. ลบ Profiles
  await prisma.freelancerProfile.deleteMany();
  await prisma.company.deleteMany();
  
  // 3. ลบ Users
  await prisma.user.deleteMany();
  
  // 4. ลบ Master Data
  await prisma.subCategory.deleteMany();
  await prisma.mainCategory.deleteMany();
  await prisma.jobType.deleteMany();
  await prisma.district.deleteMany();
  await prisma.province.deleteMany();
  await prisma.industry.deleteMany();
}

async function main() {
  await clearAll();
  console.log("🌱 เริ่มต้นการ Seed ข้อมูล (Jobs + Freelance Services)...");

  // --- 1. Master Data ---
  console.log("Creating Master Data...");
  
  // Industries
  const industries = await Promise.all(
    ["IT", "Creative", "Marketing", "Consulting"].map(name => prisma.industry.create({ data: { name } }))
  );

  // Job Types
  const jobTypes = await Promise.all(
    ["Full-Time", "Part-Time", "Freelance", "Contract"].map(name => prisma.jobType.create({ data: { name } }))
  );

  // Provinces
  const provincesData = [
    { name: "กรุงเทพมหานคร", districts: ["ปทุมวัน", "บางรัก", "จตุจักร"] },
    { name: "เชียงใหม่", districts: ["เมืองเชียงใหม่", "หางดง"] },
    { name: "ออนไลน์ / Work from Home", districts: ["-"] },
  ];
  const provinces = [];
  for (const p of provincesData) {
    const province = await prisma.province.create({
      data: {
        name: p.name,
        districts: { create: p.districts.map(name => ({ name })) },
      },
      include: { districts: true },
    });
    provinces.push(province);
  }

  // Categories
  const allMainCategories = [];
  for (const c of categoriesData) {
    const mainCat = await prisma.mainCategory.create({
      data: { name: c.name },
    });
    for (const subName of c.subs) {
      await prisma.subCategory.create({
        data: { name: subName, mainCategoryId: mainCat.id },
      });
    }
    const reloadedCat = await prisma.mainCategory.findUnique({
      where: { id: mainCat.id },
      include: { subCategorys: true }
    });
    allMainCategories.push(reloadedCat);
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  // --- 2. Create Actors (1 Employer & 1 Freelancer) ---
  console.log("Creating System Actors...");

  // 2.1 System Employer (เจ้าของ Jobs)
  const systemEmployer = await prisma.user.create({
    data: {
      email: "company@system.com",
      password: passwordHash,
      role: "EMPLOYER",
      firstName: "Central",
      lastName: "Company",
      phone: "021234567", // ✅ เพิ่ม phone
      status: "ACTIVE",
      profileImageUrl: "https://placehold.co/150x150/000000/FFF?text=CO",
      company: {
        create: {
          companyName: "Job Platform Central",
          description: "Center company for job postings",
          industryId: industries[0].id,
          isVerified: true,
        }
      }
    },
    include: { company: true }
  });

  // 2.2 System Freelancer (เจ้าของ Services)
  const systemFreelancer = await prisma.user.create({
    data: {
      email: "freelancer@system.com",
      password: passwordHash,
      role: "FREELANCER",
      firstName: "Top",
      lastName: "Freelance",
      phone: "0812345678", // ✅ เพิ่ม phone
      status: "ACTIVE",
      profileImageUrl: "https://placehold.co/150x150/28A745/FFF?text=FL",
      freelancerProfile: {
        create: {
          professionalTitle: "Multi-talented Freelancer",
          bio: "รับงานคุณภาพ ครบจบในที่เดียว",
          hourlyRate: 500,
          yearsOfExperience: 5,
          isVerified: true
        }
      }
    },
    include: { freelancerProfile: true }
  });

  // --- 3. Create Jobs (Company Side) ---
  console.log("Creating Jobs (Company posts)...");
  for (let i = 0; i < 30; i++) {
    const mainCat = randomElement(allMainCategories);
    const subCat = randomElement(mainCat.subCategorys);
    const province = randomElement(provinces);
    const district = randomElement(province.districts);

    await prisma.job.create({
      data: {
        title: `[Job] รับสมัคร ${subCat.name}`,
        description: faker.lorem.paragraph(),
        companyId: systemEmployer.company.id,
        mainCategoryId: mainCat.id,
        subCategoryId: subCat.id,
        jobTypeId: randomElement(jobTypes).id,
        provinceId: province.id,
        districtId: district.id,
        salaryMin: 20000,
        salaryMax: 40000,
        status: "PUBLISHED",
        createdAt: faker.date.recent(),
      }
    });
  }

  // --- 4. Create Services (Freelance Side) ---
  console.log("Creating Services (Freelance Gigs)...");
  
  const servicePrefixes = ["รับทำ", "รับออกแบบ", "รับเขียน", "รับปรึกษา", "มืออาชีพด้าน"];
  
  for (let i = 0; i < 30; i++) {
    const mainCat = randomElement(allMainCategories);
    const subCat = randomElement(mainCat.subCategorys); 

    await prisma.service.create({
      data: {
        title: `${randomElement(servicePrefixes)} ${subCat.name} ราคากันเอง`,
        description: `บริการ ${subCat.name} คุณภาพสูง ส่งงานไว แก้ไขได้ 3 ครั้ง \n\nสิ่งที่ลูกค้าจะได้รับ:\n- ไฟล์ต้นฉบับ\n- การซัพพอร์ตหลังส่งงาน`,
        price: parseFloat(faker.commerce.price({ min: 500, max: 15000 })),
        
        freelancerId: systemFreelancer.id,
        mainCategoryId: mainCat.id,
        // subCategoryId: subCat.id, // Uncomment ถ้า Table Service มี field นี้
        
        isActive: true,
        coverImage: `https://placehold.co/600x400/28A745/FFF?text=Service+${i+1}`,
        createdAt: faker.date.recent(),
      }
    });
  }

  console.log("✅ Seeding Completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });