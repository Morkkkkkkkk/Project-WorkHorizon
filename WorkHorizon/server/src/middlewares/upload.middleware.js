import multer from "multer";
import path from "path";
import fs from "fs";

// Helper function to create storage engine with custom destination
const createStorage = (folderName) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join("uploads", folderName);
      // Ensure directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
};

// Filter for allowed file types (Images & Documents)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Error: Only images and documents (pdf, doc, docx) are allowed!",
      ),
    );
  }
};


export const upload = multer({
  storage: createStorage("payments"), // เก็บในโฟลเดอร์ uploads/payments
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// Export pre-configured upload middlewares
export const chatUpload = multer({
  storage: createStorage("chat"),
  limits: { fileSize: 300 * 1024 * 1024 }, // 300 MB
  fileFilter: fileFilter,
});

export const defaultUpload = multer({
  storage: createStorage("misc"),
  limits: { fileSize: 300 * 1024 * 1024 },
  fileFilter: fileFilter,
});

export default upload;