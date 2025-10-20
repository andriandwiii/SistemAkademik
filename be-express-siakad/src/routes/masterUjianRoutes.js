import { Router } from "express";
import * as MasterUjianController from "../controllers/masterUjianController.js";

const router = Router();

// GET all ujian
router.get("/", MasterUjianController.getAllUjian);

// GET ujian by ID
router.get("/:id", MasterUjianController.getUjianById);

// POST new ujian
router.post("/", MasterUjianController.createUjian);

// PUT update ujian
router.put("/:id", MasterUjianController.updateUjian);

// DELETE ujian
router.delete("/:id", MasterUjianController.deleteUjian);

export default router;
