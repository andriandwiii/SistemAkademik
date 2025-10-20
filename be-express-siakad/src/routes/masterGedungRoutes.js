import express from "express";
import * as GedungController from "../controllers/gedungController.js";

const router = express.Router();

// GET semua gedung
router.get("/", GedungController.getAllGedung);

// GET gedung berdasarkan ID
router.get("/:id", GedungController.getGedungById);

// POST tambah gedung baru
router.post("/", GedungController.createGedung);

// PUT update gedung berdasarkan ID
router.put("/:id", GedungController.updateGedung);

// DELETE hapus gedung berdasarkan ID
router.delete("/:id", GedungController.deleteGedung);

export default router;
