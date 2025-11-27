import express from "express";
import * as TransaksiNilaiController from "../controllers/transaksiNilaiController.js";

const router = express.Router();

// ✅ GET — Ambil Mata Pelajaran berdasarkan Kelas (dari Jadwal)
// PENTING: Route ini harus di atas route "/:id" agar tidak bentrok
router.get("/mapel", TransaksiNilaiController.getMapelByKelas);

// GET — Ambil Data Entry Nilai (Siswa + Nilai + KKM + Predikat)
router.get("/", TransaksiNilaiController.getEntryPageData);

// POST — Simpan Nilai (Bulk Insert/Update)
router.post("/", TransaksiNilaiController.saveNilai);

// PUT — Update Nilai per Siswa berdasarkan ID transaksi nilai
router.put("/:id", TransaksiNilaiController.updateNilaiById);

// DELETE — Hapus Nilai berdasarkan ID transaksi nilai
router.delete("/:id", TransaksiNilaiController.deleteNilaiById);

export default router;