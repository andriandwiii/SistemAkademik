import express from "express";
import * as MasterTingkatanController from "../controllers/masterTingkatanController.js";

const router = express.Router();

// Ambil semua tingkatan
router.get("/", MasterTingkatanController.getAllTingkatan);

// Ambil tingkatan by ID
router.get("/:id", MasterTingkatanController.getTingkatanById);

// Tambah tingkatan
router.post("/", MasterTingkatanController.createTingkatan);

// Update tingkatan
router.put("/:id", MasterTingkatanController.updateTingkatan);

// Hapus tingkatan
router.delete("/:id", MasterTingkatanController.deleteTingkatan);

export default router;
