import express from "express";
import * as MasterJabatanController from "../controllers/masterJabatanController.js";
const router = express.Router();

router.get("/", MasterJabatanController.getAllJabatan);
router.get("/:id", MasterJabatanController.getJabatanById);
router.post("/", MasterJabatanController.createJabatan);
router.put("/:id", MasterJabatanController.updateJabatan);
router.delete("/:id", MasterJabatanController.deleteJabatan);

export default router;
