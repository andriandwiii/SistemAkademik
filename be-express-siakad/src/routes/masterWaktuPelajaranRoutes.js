// src/routes/masterWaktuPelajaranRoutes.js
import { Router } from "express";
import * as MasterWaktuPelajaranController from "../controllers/masterWaktuPelajaranController.js";

const router = Router();

// GET all waktu pelajaran
router.get("/", MasterWaktuPelajaranController.getAllWaktuPelajaran);

// GET waktu pelajaran by ID
router.get("/:id", MasterWaktuPelajaranController.getWaktuPelajaranById);

// POST new waktu pelajaran
router.post("/", MasterWaktuPelajaranController.createWaktuPelajaran);

// PUT update waktu pelajaran
router.put("/:id", MasterWaktuPelajaranController.updateWaktuPelajaran);

// DELETE waktu pelajaran
router.delete("/:id", MasterWaktuPelajaranController.deleteWaktuPelajaran);

export default router;
