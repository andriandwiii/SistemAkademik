import { Router } from "express";
import * as MasterInfoSekolahController from "../controllers/masterinfosekolahController.js";

const router = Router();

// GET all Info Sekolah
router.get("/", MasterInfoSekolahController.getAllInfoSekolah);

// GET Info Sekolah by INFO_ID
router.get("/:INFO_ID", MasterInfoSekolahController.getInfoSekolahById);

// POST new Info Sekolah
router.post("/", MasterInfoSekolahController.createInfoSekolah);

// PUT update Info Sekolah by INFO_ID
router.put("/:INFO_ID", MasterInfoSekolahController.updateInfoSekolah);

// DELETE Info Sekolah by INFO_ID
router.delete("/:INFO_ID", MasterInfoSekolahController.deleteInfoSekolah);

export default router;
