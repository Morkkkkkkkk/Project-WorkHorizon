# API Documentation

## 1. Authentication (การยืนยันตัวตน)

Base URL: `/api/auth`

+------+-----------+------------------------------------------------------------------+
|Method|URL          |Description (คำอธิบาย) |
+------+-----------+------------------------------------------------------------------+
|POST |auth/register |สมัครสมาชิกใหม่ (รองรับ Role: JOB_SEEKER, EMPLOYER, FREELANCER) |
|POST |auth/login    |เข้าสู่ระบบ (รับ Token)                                          |
|GET  |auth/me       |ดึงข้อมูลผู้ใช้งานปัจจุบัน (ต้องมี Token)                              |
+------+-----------+------------------------------------------------------------------+

## 2. Users (จัดการผู้ใช้งาน)

Base URL: `/api/users`
_Requires Authentication_

+------+----------------------------+------------------------------------------------------------+
|Method|URL                    |Description (คำอธิบาย) |
+------+----------------------------+------------------------------------------------------------+
|GET   |/me                    |ดูข้อมูลโปรไฟล์ส่วนตัว |
|PUT   |/me                    |แก้ไขข้อมูลโปรไฟล์ส่วนตัว |
|PUT   |/me/profile-picture    |อัปโหลดรูปโปรไฟล์ |
|GET   |/me/educations         |ดึงข้อมูลการศึกษา (Job Seeker) |
|POST  |/me/educations         |เพิ่มข้อมูลการศึกษา (Job Seeker) |
|PUT   |/me/educations/:eduId  |แก้ไขข้อมูลการศึกษา (Job Seeker) |
|DELETE|/me/educations/:eduId  |ลบข้อมูลการศึกษา (Job Seeker) |
|GET   |/me/experiences        |ดึงข้อมูลประสบการณ์ทำงาน (Job Seeker) |
|POST  |/me/experiences        |เพิ่มข้อมูลประสบการณ์ทำงาน (Job Seeker) |
|PUT   |/me/experiences/:expId |แก้ไขข้อมูลประสบการณ์ทำงาน (Job Seeker) |
|DELETE|/me/experiences/:expId |ลบข้อมูลประสบการณ์ทำงาน (Job Seeker) |
|GET   |/me/skills             |ดึงข้อมูลทักษะ (Candidate) |
|PUT   |/me/skills             |อัปเดตข้อมูลทักษะ (Candidate) |
|GET   |/me/resumes            |ดึงข้อมูลเรซูเม่ (Job Seeker) |
|POST  |/me/resumes/upload     |อัปโหลดเรซูเม่ (Job Seeker) |
|DELETE|/me/resumes/:resumeId  |ลบเรซูเม่ (Job Seeker) |
|GET   |/me/saved-jobs         |ดึงงานที่บันทึกไว้ (Job Seeker) |
|POST  |/me/saved-jobs         |บันทึกงาน (Job Seeker) |
|DELETE|/me/saved-jobs/:jobId  |ยกเลิกบันทึกงาน (Job Seeker) |
|GET   |/me/recommendations    |ดึงงานแนะนำ (Job Seeker) |
|POST  |/me/change-password    |เปลี่ยนรหัสผ่าน |
+------+----------------------------+------------------------------------------------------------+

## 3. Companies (บริษัท)

Base URL: `/api/companies`

+------+-----------------+------------------------------------------------------------+
|Method|URL              |Description (คำอธิบาย) |
+------+-----------------+------------------------------------------------------------+
|GET   |/me              |ดึงข้อมูลบริษัทของฉัน (Employer Only) |
|PUT   |/me              |แก้ไขข้อมูลบริษัทของฉัน (Employer Only) |
|GET   |/me/jobs         |ดึงงานทั้งหมดของบริษัทฉัน (Employer Only) |
|PUT   |/me/logo         |อัปโหลดโลโก้บริษัท (Employer Only) |
|POST  |/                |สร้างบริษัทใหม่ (Employer Only) |
|GET   |/:companyId      |ดูข้อมูลบริษัท (Public) |
+------+-----------------+------------------------------------------------------------+

## 4. Jobs (งาน)

Base URL: `/api/jobs`

+------+--------------------+------------------------------------------------------------+
|Method|URL                 |Description (คำอธิบาย) |
+------+--------------------+------------------------------------------------------------+
|GET   |/                   |ค้นหางาน (Public) |
|GET   |/:jobId             |ดูรายละเอียดงาน (Public) |
|POST  |/                   |สร้างประกาศงานใหม่ (Employer Only) |
|PUT   |/:jobId             |แก้ไขประกาศงาน (Employer Only) |
|DELETE|/:jobId             |ลบประกาศงาน (Employer Only) |
|PATCH |/:jobId/status      |เปลี่ยนสถานะงาน (Employer Only) |
|GET   |/:jobId/applications|ดึงใบสมัครของงานนี้ (Employer Only) |
|POST  |/:jobId/images      |อัปโหลดรูปภาพประกอบงาน (Employer Only) |
|DELETE|/images/:imageId    |ลบรูปภาพประกอบงาน (Employer Only) |
+------+--------------------+------------------------------------------------------------+

## 5. Applications (การสมัครงาน)

Base URL: `/api/applications`
_Requires Authentication_

+------+---------------------+------------------------------------------------------------+
|Method|URL                  |Description (คำอธิบาย) |
+------+---------------------+------------------------------------------------------------+
|POST  |/                    |ส่งใบสมัครงาน (Job Seeker) |
|GET   |/my                  |ดูประวัติการสมัครงานของฉัน (Job Seeker) |
|GET   |/:appId/conversation |ดึง/สร้างห้องแชทสำหรับใบสมัครนี้ |
|GET   |/:appId              |ดูรายละเอียดใบสมัคร |
|PATCH |/:appId/status       |อัปเดตสถานะใบสมัคร (Employer Only) |
|POST  |/:appId/notes        |เพิ่มโน้ตภายใน (Employer Only) |
|POST  |/:appId/rating       |ให้คะแนนผู้สมัคร (Employer Only) |
|DELETE|/:appId              |ลบใบสมัคร (Employer Only) |
+------+---------------------+------------------------------------------------------------+

## 6. Conversations (แชท)

Base URL: `/api/conversations`
_Requires Authentication_

+------+--------------------+------------------------------------------------------------+
|Method |URL                |Description (คำอธิบาย) |
+------+--------------------+------------------------------------------------------------+
|GET    |/                  |ดึงรายการห้องแชททั้งหมด |
|DELETE |/:convoId          |ลบห้องแชท |
|GET    |/:convoId/messages |ดึงข้อความในห้องแชท |
|POST   |/:convoId/messages |ส่งข้อความ |
+------+--------------------+------------------------------------------------------------+

## 7. Notifications (แจ้งเตือน)

Base URL: `/api/notifications`
_Requires Authentication_

+------+----------------------+------------------------------------------------------------+
|Method|URL                   |Description (คำอธิบาย) |
+------+----------------------+------------------------------------------------------------+
|GET   |/                     |ดึงรายการแจ้งเตือน |
|PATCH |/:notificationId/read |อ่านแจ้งเตือน (รายอัน) |
|POST  |/read-all             |อ่านแจ้งเตือนทั้งหมด |
|DELETE|/:notificationId      |ลบแจ้งเตือน |
+------+----------------------+------------------------------------------------------------+

## 8. Master Data (ข้อมูลหลัก)

Base URL: `/api/data`
_Public Access_

+------+------------------------------------------------+--------------------------------------+
|Method|URL                                             |Description (คำอธิบาย) |
+------+------------------------------------------------+---------------------------------------
|GET   |/job-types                                      |ดึงข้อมูลประเภทงาน |
|GET   |/industries                                     |ดึงข้อมูลอุตสาหกรรม |
|GET   |/skills                                         |ดึงข้อมูลทักษะ |
|GET   |/provinces                                      |ดึงข้อมูลจังหวัด |
|GET   |/provinces/:provinceId/districts                |ดึงข้อมูลอำเภอในจังหวัด |
|GET   |/main-categories/:mainCategoryId/sub-categories |ดึงข้อมูลหมวดหมู่ย่อย |
+------+------------------------------------------------+--------------------------------------+

## 9. Admin (ผู้ดูแลระบบ)

Base URL: `/api/admin`
_Requires Admin Role_

+------+-------------------------+------------------------------------------------------------+
|Method|URL                      |Description (คำอธิบาย) |
+------+-------------------------+------------------------------------------------------------+
|GET    |/companies              |ดึงบริษัททั้งหมด |
|PATCH  |/companies/:id/verify   |ยืนยันบริษัท (Verify) |
|GET    |/users                  |ดึงผู้ใช้งานทั้งหมด |
|POST   |/users                  |สร้างผู้ใช้งาน (Admin) |
|PUT    |/users/:userId          |แก้ไขผู้ใช้งาน |
|DELETE |/users/:userId          |ลบผู้ใช้งาน |
|GET    |/jobs                   |ดึงงานทั้งหมด |
|PUT    |/jobs/:jobId            |แก้ไขงาน (Admin) |
|DELETE |/jobs/:jobId            |ลบงาน (Admin) |
|GET    |/stats                  |ดูสถิติระบบ |
|PATCH  |/users/:userId/status   |อัปเดตสถานะผู้ใช้งาน (Active/Inactive) |
|GET    |/featured-sections      |จัดการ Featured Sections |
|...    |...                     |(Master Data CRUD: sub-categories, skills, job-types, etc.) |
+------+-------------------------+------------------------------------------------------------+

## 10. Advertisements (โฆษณา)

Base URL: `/api/advertisements`

+------+----------------+------------------------------------------------------------+
|Method|URL             |Description (คำอธิบาย) |
+------+----------------+------------------------------------------------------------+
|GET    |/              |ดึงโฆษณา (Public) |
|GET    |/admin         |ดึงโฆษณาสำหรับ Admin (Admin Only) |
|POST   |/              |สร้างโฆษณา (Admin Only) |
|PUT    |/:adId         |แก้ไขโฆษณา (Admin Only) |
|POST   |/:adId/image   |แก้ไขรูปโฆษณา (Admin Only) |
|DELETE |/:adId         |ลบโฆษณา (Admin Only) |
+------+----------------+------------------------------------------------------------+

## 11. Main Categories (หมวดหมู่หลัก)

Base URL: `/api/main-categories`

+------+-------------+------------------------------------------------------------+
|Method |URL         |Description (คำอธิบาย) |
+------+-------------+------------------------------------------------------------+
|GET    |/           |ดึงหมวดหมู่หลักทั้งหมด (Public) |
|POST   |/           |สร้างหมวดหมู่หลัก (Admin Only) |
|PUT    |/:id        |แก้ไขหมวดหมู่หลัก (Admin Only) |
|POST   |/:id/image  |แก้ไขรูปหมวดหมู่หลัก (Admin Only) |
|DELETE |/:id        |ลบหมวดหมู่หลัก (Admin Only) |
+------+-------------+------------------------------------------------------------+

## 12. Featured Sections (เซคชั่นแนะนำ)

Base URL: `/api/featured-sections`

+------+-------+------------------------------------------------------------+
|Method |URL   |Description (คำอธิบาย) |
+------+-------+------------------------------------------------------------+
|GET    |/     |ดึง Featured Sections สำหรับหน้าแรก (Public) |
+------+-------+------------------------------------------------------------+

## 13. Freelancers (ฟรีแลนซ์)

Base URL: `/api/freelancers`

+------+--------------------------+------------------------------------------------------------+
|Method |URL                      |Description (คำอธิบาย) |
+------+--------------------------+------------------------------------------------------------+
|GET    |/me                      |ดูโปรไฟล์ฟรีแลนซ์ของฉัน (Freelancer Only) |
|PUT    |/me                      |แก้ไขโปรไฟล์ฟรีแลนซ์ของฉัน (Freelancer Only) |
|PUT    |/me/profile-picture      |อัปโหลดรูปโปรไฟล์ (Freelancer Only) |
|GET    |/hires                   |ดึงงานที่ฉันจ้าง (My Hires - Job Seeker) |
|POST   |/work                    |สร้างใบเสนอราคา/งาน (Freelancer Only) |
|PUT    |/work/:workId/status     |อัปเดตสถานะงาน (Accept, Submit, Complete, etc.) |
|DELETE |/work/:workId            |ลบงาน (Freelancer Only) |
|GET    |/:freelancerId           |ดูโปรไฟล์ฟรีแลนซ์อื่น (Public) |
|POST   |/:freelancerId/reviews   |ส่งรีวิวให้ฟรีแลนซ์ (Job Seeker) |
+------+--------------------------+------------------------------------------------------------+

## 14. Services (บริการ)

Base URL: `/api/services`

+------+----------------------------------+--------------------------------------------------+
|Method |URL                              |Description (คำอธิบาย) |
+------+----------------------------------+--------------------------------------------------+
|GET    |/:serviceId/conversation         |ดึง/สร้างสนทนาสำหรับบริการ |
|GET    |/me                              |ดึงบริการของฉัน (Freelancer Only) |
|GET    |/                                |ค้นหาบริการ (Public) |
|GET    |/:id                             |ดูรายละเอียดบริการ (Public) |
|POST   |/                                |สร้างบริการ (Freelancer Only) |
|PUT    |/:id                             |แก้ไขบริการ (Freelancer Only) |
|DELETE |/:id                             |ลบบริการ (Freelancer Only) |
+------+----------------------------------+---------------------------------------------------+

## 15. Reviews (รีวิว)

Base URL: `/api/reviews` (หรืออาจซ้อนใน Freelancer/Service)

+------+-----------------------------+------------------------------------------------------------+
|Method|URL                          |Description (คำอธิบาย) |
+------+-----------------------------+------------------------------------------------------------+
|POST  |/:freelancerId/reviews       |สร้างรีวิว (Authenticated) |
|GET   |/:freelancerId/reviews       |ดึงรีวิวของฟรีแลนซ์ |
|GET   |/services/:serviceId/reviews |ดึงรีวิวของบริการ |
+------+-----------------------------+------------------------------------------------------------+
