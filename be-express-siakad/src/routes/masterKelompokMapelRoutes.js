import express from "express";
import {
  getAllKelompokMapel,
  createKelompokMapel,
  updateKelompokMapel,
  deleteKelompokMapel,
} from "../controllers/masterKelompokMapelController.js";

const router = express.Router();

// 🔹 Endpoint: /api/kelompok-mapel
router.get("/", getAllKelompokMapel);          // Ambil semua data
router.post("/", createKelompokMapel);        // Tambah data baru
router.put("/:id", updateKelompokMapel);      // Update data berdasarkan ID
router.delete("/:id", deleteKelompokMapel);   // Hapus data berdasarkan ID

export default router;