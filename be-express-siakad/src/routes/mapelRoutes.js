import { Router } from "express";
import * as MapelController from "../controllers/mapelController.js";

const router = Router();

// GET all mapel
router.get("/", MapelController.getAllMapel);

// GET mapel by ID
router.get("/:id", MapelController.getMapelById);

// POST new mapel
router.post("/", MapelController.createMapel);

// PUT update mapel
router.put("/:id", MapelController.updateMapel);

// DELETE mapel
router.delete("/:id", MapelController.deleteMapel);

export default router;
