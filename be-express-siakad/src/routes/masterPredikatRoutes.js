import express from "express";
import * as PredikatController from "../controllers/masterPredikatController.js";

const router = express.Router();

// GET: Ambil semua data predikat
router.get("/", PredikatController.getAllPredikat);

// POST: Tambah predikat baru (dengan validasi jadwal otomatis)
router.post("/", PredikatController.createPredikat);

// PUT: Update predikat by ID
router.put("/:id", PredikatController.updatePredikat);

// DELETE: Hapus predikat by ID
router.delete("/:id", PredikatController.deletePredikat);

export default router;