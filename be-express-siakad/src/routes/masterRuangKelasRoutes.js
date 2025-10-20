import express from "express";
import * as MasterRuangController from "../controllers/masterRuangKelasController.js";

const router = express.Router();

// Ambil semua ruang kelas
router.get("/", MasterRuangController.getAllRuang);

// Ambil ruang kelas by ID
router.get("/:id", MasterRuangController.getRuangById);

// Tambah ruang kelas
router.post("/", MasterRuangController.createRuang);

// Update ruang kelas
router.put("/:id", MasterRuangController.updateRuang);

// Hapus ruang kelas
router.delete("/:id", MasterRuangController.deleteRuang);

export default router;
