// File baru: src/routes/transaksiKenaikanKelasRoutes.js

import express from "express";
// Import controller yang sudah kita buat
import { prosesKenaikanRombelController } from "../controllers/transaksiKenaikakanKelasController.js";
// (Pastikan nama 'transaksiKenaikakanKelasController.js' sudah benar)

const router = express.Router();

/**
 * @route   POST /api/kenaikan-kelas
 * @desc    Endpoint utama untuk memproses kenaikan kelas/tinggal kelas/kelulusan.
 * @access  Private (Admin/Kurikulum)
 */
router.post("/", prosesKenaikanRombelController);

export default router;