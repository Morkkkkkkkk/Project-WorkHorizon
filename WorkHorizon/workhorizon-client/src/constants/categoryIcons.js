// src/constants/categoryIcons.js

import {
  Code,
  Palette,
  Megaphone,
  BriefcaseBusiness,
  TrendingUp,
  Book,
  Camera,
  Heart,
  Briefcase,
  Layers,
  Brain,
  MonitorPlay,
  Hammer,
  Users,
} from 'lucide-react';

// 1. Array ของไอคอนที่อนุญาตให้ Admin เลือกได้
export const AVAILABLE_ICONS = [
    { code: 'CODE', name: 'Code (พัฒนาซอฟต์แวร์)' },
    { code: 'DESIGN', name: 'Palette (กราฟิก)' },
    { code: 'MARKETING', name: 'Megaphone (การตลาด)' },
    { code: 'CONSULTANT', name: 'BriefcaseBusiness (ที่ปรึกษา)' },
    { code: 'FINANCE', name: 'TrendingUp (การเงิน)' },
    { code: 'EDUCATION', name: 'Book (การศึกษา)' },
    { code: 'PHOTOGRAPHY', name: 'Camera (ภาพถ่าย)' },
    { code: 'HR', name: 'Heart (HR/บุคคล)' },
    { code: 'GENERAL', name: 'Briefcase (งานทั่วไป)' },
    { code: 'BRAIN', name: 'Brain (AI/R&D)' },
    { code: 'VIDEO', name: 'MonitorPlay (สื่อ/วิดีโอ)' },
    { code: 'ENGINEERING', name: 'Hammer (วิศวกรรม/ช่าง)' },
    { code: 'OTHER', name: 'Layers (อื่น ๆ)' },
];

// 2. Object Mapping: ตารางจับคู่รหัสกับ Component จริงๆ
export const CATEGORY_ICONS = {
  CODE: Code,
  DESIGN: Palette,
  MARKETING: Megaphone,
  CONSULTANT: BriefcaseBusiness,
  FINANCE: TrendingUp,
  EDUCATION: Book,
  PHOTOGRAPHY: Camera,
  HR: Heart,
  GENERAL: Briefcase,
  LAYERS: Layers,
  BRAIN: Brain,
  USERS: Users,
  VIDEO: MonitorPlay,
  ENGINEERING: Hammer,
  OTHER: Layers,
  
  DEFAULT: BriefcaseBusiness,
};