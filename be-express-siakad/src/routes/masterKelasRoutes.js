import express from "express";
import * as MasterKelasController from "../controllers/masterKelasController.js";

const router = express.Router();

/**
 * ✅ Master Kelas Routes
 * Base path: /master-kelas
 */

// Ambil semua data kelas
router.get("/", MasterKelasController.getAllKelas);

// Ambil 1 data kelas berdasarkan ID
router.get("/:id", MasterKelasController.getKelasById);

// Tambah kelas baru
router.post("/", MasterKelasController.createKelas);

// Update kelas berdasarkan ID
router.put("/:id", MasterKelasController.updateKelas);

// Hapus kelas berdasarkan ID
router.delete("/:id", MasterKelasController.deleteKelas);

export default router;
