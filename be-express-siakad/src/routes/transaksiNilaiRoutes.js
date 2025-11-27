import express from "express";
import * as TransaksiNilaiController from "../controllers/TransaksiNilaiController.js";

const router = express.Router();

// GET — Ambil Data Entry Nilai (Siswa + Nilai + KKM + Predikat)
router.get("/", TransaksiNilaiController.getEntryPageData);

// POST — Simpan Nilai (Bulk Insert/Update)
router.post("/", TransaksiNilaiController.saveNilai);

// PUT — (Opsional) Update Nilai per Siswa berdasarkan ID transaksi nilai
router.put("/:id", TransaksiNilaiController.updateNilaiById);

// DELETE — (Opsional) Hapus Nilai berdasarkan ID transaksi nilai
router.delete("/:id", TransaksiNilaiController.deleteNilaiById);

export default router;
