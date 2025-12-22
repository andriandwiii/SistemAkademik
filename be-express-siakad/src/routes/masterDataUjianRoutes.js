// src/routes/masterDataUjianRoutes.js
import { Router } from "express";
import * as MasterUjianController from "../controllers/masterDataUjianController.js";

const router = Router();

// GET semua ujian
router.get("/", MasterUjianController.getAllUjian);

// GET ujian by ID
router.get("/id/:id", MasterUjianController.getUjianById);

// GET ujian by KODE_UJIAN
router.get("/kode/:kode", MasterUjianController.getUjianByKode);

// POST tambah ujian
router.post("/", MasterUjianController.addUjian);

// PUT update ujian
router.put("/:id", MasterUjianController.updateUjian);

// DELETE ujian
router.delete("/:id", MasterUjianController.deleteUjian);

export default router;
