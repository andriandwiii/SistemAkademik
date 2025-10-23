import { Router } from "express";
import upload from "../middleware/upload-foto.js"; // middleware untuk upload foto
import * as SiswaController from "../controllers/siswaController.js";

const router = Router();

// GET all siswa
router.get("/", SiswaController.getAllSiswa);

// GET siswa by ID
router.get("/:id", SiswaController.getSiswaById);

// POST new siswa (dengan upload foto)
router.post("/", upload.single("foto"), SiswaController.addSiswa);

// PUT update siswa (dengan upload foto)
router.put("/:id", upload.single("foto"), SiswaController.updateSiswa);

// DELETE siswa
router.delete("/:id", SiswaController.deleteSiswa);

export default router;