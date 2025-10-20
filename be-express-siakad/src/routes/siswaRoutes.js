import { Router } from "express";
import * as SiswaController from "../controllers/siswaController.js";

const router = Router();

// GET all siswa
router.get("/", SiswaController.getAllSiswa);

// GET siswa by ID
router.get("/:id", SiswaController.getSiswaById);

// POST new siswa
router.post("/", SiswaController.addSiswa);

// PUT update siswa
router.put("/:id", SiswaController.updateSiswa);

// DELETE siswa
router.delete("/:id", SiswaController.deleteSiswa);

export default router;
