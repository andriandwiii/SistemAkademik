// routes/masterTahunAjaranRoutes.js
import express from "express";
import * as TahunAjaranController from "../controllers/masterTahunAjaranController.js";

const router = express.Router();

// GET semua tahun ajaran
router.get("/", TahunAjaranController.getAllTahunAjaran);

// GET tahun ajaran berdasarkan ID
router.get("/:id", TahunAjaranController.getTahunAjaranById);

// POST tambah tahun ajaran
router.post("/", TahunAjaranController.addTahunAjaran);

// PUT update tahun ajaran
router.put("/:id", TahunAjaranController.updateTahunAjaran);

// DELETE hapus tahun ajaran
router.delete("/:id", TahunAjaranController.deleteTahunAjaran);

export default router;
