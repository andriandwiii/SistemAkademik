import express from "express";
import * as PelanggaranController from "../controllers/masterPelanggaranController.js";

const router = express.Router();

// GET: Ambil semua data katalog pelanggaran (Kategori, Poin, Tindakan)
router.get("/", PelanggaranController.getAllMasterPelanggaran);

// GET: Ambil detail pelanggaran berdasarkan ID
router.get("/:id", PelanggaranController.getMasterPelanggaranById);

// POST: Tambah jenis pelanggaran baru ke dalam katalog
router.post("/", PelanggaranController.createMasterPelanggaran);

// PUT: Update data pelanggaran (misal ubah bobot poin atau tindakan)
router.put("/:id", PelanggaranController.updateMasterPelanggaran);

// DELETE: Hapus jenis pelanggaran dari katalog
router.delete("/:id", PelanggaranController.deleteMasterPelanggaran);

export default router;