import { Router } from "express";
import * as masterGuruController from "../controllers/masterGuruController.js";
import upload from "../middleware/upload-foto.js";

const router = Router();

// Endpoint Khusus (Taruh di atas route dengan parameter :id)
router.get("/petugas-tu", masterGuruController.getPetugasTU);

// Endpoint Standar
router.get("/", masterGuruController.getAllGuru);
router.get("/:id", masterGuruController.getGuruById);
router.get("/jabatan/:kode_jabatan", masterGuruController.getGuruByJabatanController);
router.get("/jabatan/nama/:nama_jabatan", masterGuruController.getGuruByNamaJabatanController);

// Endpoint Mutasi Data
router.post("/", upload.single("foto"), masterGuruController.createGuru);
router.put("/:id", upload.single("foto"), masterGuruController.updateGuru); 
router.delete("/:id", masterGuruController.deleteGuru);

export default router;