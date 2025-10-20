
import { Router } from "express";
import * as MasterWilayahController from "../controllers/masterWilayahController.js"; // Konsisten dengan penamaan


const router = Router();

// GET all guru
router.get("/", MasterWilayahController.getAllWilayah);

// GET guru by ID
router.get("/:id", MasterWilayahController.getWilayahById);

// POST new guru
router.post("/", MasterWilayahController.createWilayah);

// PUT update guru
router.put("/:id", MasterWilayahController.updateWilayah);

// DELETE guru
router.delete("/:id", MasterWilayahController.deleteWilayah);

export default router;