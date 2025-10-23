import multer from "multer";
import path from "path";
import fs from "fs";

// Tentukan folder penyimpanan berdasarkan URL endpoint
const getUploadFolder = (req) => {
  const url = req.originalUrl.toLowerCase();

  // Siswa: register atau master
  if (url.includes("register-siswa") || url.includes("siswa")) {
    return "./uploads/foto_siswa";
  }

  // Guru: register atau master
  if (url.includes("register-guru") || url.includes("master-guru")) {
    return "./uploads/foto_guru";
  }

  // fallback folder
  return "./uploads/foto_lainnya";
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = getUploadFolder(req);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter hanya file gambar
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diizinkan (jpg, jpeg, png, gif)"));
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
