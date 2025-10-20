import express from "express";
import * as mapelKelasController from "../controllers/mapelKelasController.js";

const router = express.Router();

// GET semua mapel-kelas
router.get("/", mapelKelasController.getAllMapelKelas);

// GET detail by ID
router.get("/:id", mapelKelasController.getMapelKelasById);

// POST tambah mapel-kelas
router.post("/", mapelKelasController.createMapelKelas);

// PUT update mapel-kelas
router.put("/:id", mapelKelasController.updateMapelKelas);

// DELETE hapus mapel-kelas
router.delete("/:id", mapelKelasController.deleteMapelKelas);

export default router;
