import { Router } from "express";
import * as MasterAsetSekolahController from "../controllers/masterAsetSekolahController.js";

const router = Router();

// GET semua aset
router.get("/", MasterAsetSekolahController.getAllAset);

// GET aset by ID
router.get("/:id", MasterAsetSekolahController.getAsetById);

// POST aset baru
router.post("/", MasterAsetSekolahController.createAset);

// PUT update aset
router.put("/:id", MasterAsetSekolahController.updateAset);

// DELETE aset
router.delete("/:id", MasterAsetSekolahController.deleteAset);

export default router;
