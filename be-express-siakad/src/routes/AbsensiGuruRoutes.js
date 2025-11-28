import express from "express";
import * as AbsensiGuruController from "../controllers/AbsensiGuruController.js";
import { uploadAbsensi } from "../middleware/upload-foto.js";

const router = express.Router();

/* ===========================================================
 * ROUTES ABSENSI GURU
 * Base URL: /api/absensi-guru
 * =========================================================== */

// 0. LIST GURU (GET) - PENTING!
// Digunakan untuk mengisi dropdown nama guru di Frontend
// Endpoint: /api/absensi-guru/list-guru
router.get("/list-guru", AbsensiGuruController.getListGuru);

// 1. CEK STATUS (GET)
// Cek status hari ini: Belum Absen / Sudah Masuk / Selesai
// Endpoint: /api/absensi-guru/status?nip=...
router.get("/status", AbsensiGuruController.cekStatusHarian);

// 2. ABSEN MASUK (POST)
// Upload foto wajib ada di sini (FOTO_MASUK)
// Endpoint: /api/absensi-guru/masuk
router.post("/masuk", uploadAbsensi.single("FOTO_MASUK"), AbsensiGuruController.absenMasuk);

// 3. ABSEN PULANG (POST)
// Tidak pakai upload foto (sesuai request "tidak usah saat pulangnya")
// Endpoint: /api/absensi-guru/pulang
router.post("/pulang", AbsensiGuruController.absenPulang);

// 4. RIWAYAT SAYA (GET)
// Endpoint: /api/absensi-guru/riwayat?nip=...
router.get("/riwayat", AbsensiGuruController.getRiwayatSaya);

// 5. REKAP ADMIN (GET)
// Endpoint: /api/absensi-guru/rekap?startDate=...&endDate=...
router.get("/rekap", AbsensiGuruController.getRekapAbsensiAdmin);

// 6. HAPUS DATA (DELETE)
// Endpoint: /api/absensi-guru/:id
router.delete("/:id", AbsensiGuruController.deleteAbsensi);

export default router;