import express from "express";
import * as BukuIndukCtrl from "../controllers/bukuIndukController.js";
import { verifyToken, authorizeRoles } from "../middleware/jwt.js";

const router = express.Router();

// ============================================================
// 📋 ENDPOINT ADMIN/KURIKULUM
// ============================================================

router.get(
    "/generate", 
    verifyToken, 
    authorizeRoles("SUPER_ADMIN", "KURIKULUM"), 
    BukuIndukCtrl.getFullDataBukuInduk
);

// ============================================================
// 👨‍🏫 ENDPOINT WALI KELAS
// ============================================================

// GET — Info kelas yang diampu sebagai wali kelas
router.get(
    "/wali-kelas/info", 
    verifyToken, 
    authorizeRoles("GURU"), 
    BukuIndukCtrl.getInfoKelasWali
);

// GET — Daftar siswa di kelas wali (per tahun ajaran)
router.get(
    "/wali-kelas/siswa", 
    verifyToken, 
    authorizeRoles("GURU"), 
    BukuIndukCtrl.getSiswaKelasWaliByTahun
);

// GET — Generate raport siswa (dengan validasi kepemilikan kelas)
router.get(
    "/wali-kelas/generate", 
    verifyToken, 
    authorizeRoles("GURU"), 
    BukuIndukCtrl.getFullDataBukuIndukByWaliKelas
);

// ============================================================
// 👨‍🎓 ENDPOINT SISWA
// ============================================================

// GET — Profile siswa (biodata + daftar tahun ajaran)
router.get(
    "/siswa/profile", 
    verifyToken, 
    authorizeRoles("SISWA"), 
    BukuIndukCtrl.getProfileSiswa
);

// GET — Info kelas siswa berdasarkan tahun ajaran
router.get(
    "/siswa/kelas", 
    verifyToken, 
    authorizeRoles("SISWA"), 
    BukuIndukCtrl.getInfoKelasSiswa
);

// GET — Daftar semester yang tersedia untuk siswa
router.get(
    "/siswa/semester", 
    verifyToken, 
    authorizeRoles("SISWA"), 
    BukuIndukCtrl.getSemesterTersedia
);

// GET — Generate raport siswa (hanya bisa lihat punya sendiri)
router.get(
    "/siswa/raport", 
    verifyToken, 
    authorizeRoles("SISWA"), 
    BukuIndukCtrl.getRaportSiswa
);

// ============================================================
// 🔄 BACKWARD COMPATIBILITY
// ============================================================

router.get(
    "/siswa-kelas-wali", 
    verifyToken, 
    authorizeRoles("GURU"), 
    BukuIndukCtrl.getSiswaKelasWali
);

export default router;