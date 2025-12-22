import express from "express";
import * as laporanKeuanganController
  from "../controllers/laporankeuanganController.js";

const router = express.Router();

/**
 * GET
 * /api/laporan/dashboard
 * ?tahun_ajaran_id=
 */
router.get(
  "/dashboard",
  laporanKeuanganController.getDashboardSummary
);

/**
 * GET
 * /api/laporan/tunggakan
 * ?tahun_ajaran_id=
 * &batas_waktu=
 */
router.get(
  "/tunggakan",
  laporanKeuanganController.getLaporanTunggakan
);

/**
 * GET
 * /api/laporan/rekap-kelas
 * ?tahun_ajaran_id=
 */
router.get(
  "/rekap-kelas",
  laporanKeuanganController.getRekapPerKelas
);

/**
 * GET
 * /api/laporan/pembayaran
 * ?start_date=
 * &end_date=
 * &metode_bayar=
 * &nis=
 */
router.get(
  "/pembayaran",
  laporanKeuanganController.getLaporanPembayaran
);

/**
 * GET
 * /api/laporan/tunggakan-komponen
 * ?tahun_ajaran_id=
 */
router.get(
  "/tunggakan-komponen",
  laporanKeuanganController.getTunggakanPerKomponen
);

/**
 * GET
 * /api/laporan/history/:nis
 * ?tahun_ajaran_id=
 */
router.get(
  "/history/:nis",
  laporanKeuanganController.getHistoryPembayaranSiswa
);

export default router;
