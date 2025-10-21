import multer from "multer";
import path from "path";
import fs from "fs";

// Tentukan folder penyimpanan berdasarkan URL endpoint
const getUploadFolder = (req) => {
  if (req.originalUrl.includes("register-siswa")) return "./uploads/foto_siswa";
  if (req.originalUrl.includes("register-guru")) return "./uploads/foto_guru";
  return "./uploads/foto_lainnya"; // fallback folder
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = getUploadFolder(req);
    // Buat folder jika belum ada
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
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
