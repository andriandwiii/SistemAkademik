import express from "express";
// Cek apakah path file ini sudah benar sesuai folder Anda
import * as KehadiranCtrl from "../controllers/kehadiranController.js";

const router = express.Router();

router.get("/cek-kehadiran", KehadiranCtrl.getKehadiranSiswa);
router.post("/simpan-kehadiran", KehadiranCtrl.saveKehadiran);

// Jika KehadiranCtrl.deleteKehadiran undefined, baris ini yang bikin error:
router.delete("/hapus/:nis", KehadiranCtrl.deleteKehadiran);

export default router;