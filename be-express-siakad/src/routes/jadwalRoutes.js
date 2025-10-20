import express from "express";
import * as JadwalController from "../controllers/jadwalController.js";

const router = express.Router();

// ✅ Ambil semua jadwal
router.get("/", JadwalController.getAllJadwal);

// ✅ Tambah jadwal
router.post("/", JadwalController.createJadwal);

// ✅ Ambil jadwal by ID
router.get("/:id", JadwalController.getJadwalById);

// ✅ Update jadwal
router.put("/:id", JadwalController.updateJadwal);

router.get("/kelas/:kelasId", JadwalController.getJadwalByKelas);
router.get("/guru/:guruId", JadwalController.getJadwalByGuru);
router.get("/hari/:hariId", JadwalController.getJadwalByHari);

router.get("/:id/siswa", JadwalController.getSiswaByJadwal); 

// ✅ Hapus jadwal
router.delete("/:id", JadwalController.deleteJadwal);

export default router;
