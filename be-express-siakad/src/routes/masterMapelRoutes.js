import { Router } from "express";
import * as MasterMapelController from "../controllers/masterMapelController.js";

const router = Router();

// GET all mapel
router.get("/", MasterMapelController.getAllMapel);

// GET mapel by ID
router.get("/:id", MasterMapelController.getMapelById);

// POST new mapel
router.post("/", MasterMapelController.createMapel);

// PUT update mapel
router.put("/:id", MasterMapelController.updateMapel);

// DELETE mapel
router.delete("/:id", MasterMapelController.deleteMapel);

export default router;
