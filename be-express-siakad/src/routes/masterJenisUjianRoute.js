import express from "express";
import * as MasterJenisUjianController from "../controllers/masterJenisUjianController.js";

const router = express.Router();

// Ambil semua jenis ujian
router.get("/", MasterJenisUjianController.getAllJenisUjian);

// Ambil jenis ujian by ID
router.get("/:id", MasterJenisUjianController.getJenisUjianById);

// Tambah jenis ujian
router.post("/", MasterJenisUjianController.addJenisUjian);

// Update jenis ujian
router.put("/:id", MasterJenisUjianController.updateJenisUjian);

// Hapus jenis ujian
router.delete("/:id", MasterJenisUjianController.deleteJenisUjian);

export default router;
