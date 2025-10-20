// src/routes/masterKurikulumRoutes.js
import { Router } from "express";
import * as MasterKurikulumController from "../controllers/masterKurikulumController.js";

const router = Router();

// GET all kurikulum
router.get("/", MasterKurikulumController.getAllKurikulum);

// GET kurikulum by ID
router.get("/:id", MasterKurikulumController.getKurikulumById);

// POST new kurikulum
router.post("/", MasterKurikulumController.createKurikulum);

// PUT update kurikulum
router.put("/:id", MasterKurikulumController.updateKurikulum);

// DELETE kurikulum
router.delete("/:id", MasterKurikulumController.deleteKurikulum);

export default router;
