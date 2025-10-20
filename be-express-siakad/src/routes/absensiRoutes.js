import express from "express";
import * as AbsensiController from "../controllers/absensiController.js";

const router = express.Router();

// ABSENSI SISWA
router.get("/siswa", AbsensiController.getAllAbsensiSiswa);
router.post("/siswa", AbsensiController.createAbsensiSiswa);
router.put("/siswa/:id", AbsensiController.updateAbsensiSiswa);
router.delete("/siswa/:id", AbsensiController.deleteAbsensiSiswa);

// ABSENSI GURU
router.get("/guru", AbsensiController.getAllAbsensiGuru);
router.post("/guru", AbsensiController.createAbsensiGuru);
router.put("/guru/:id", AbsensiController.updateAbsensiGuru);
router.delete("/guru/:id", AbsensiController.deleteAbsensiGuru);

export default router;
