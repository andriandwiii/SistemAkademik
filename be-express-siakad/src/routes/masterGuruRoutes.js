import { Router } from "express";
import * as masterGuruController from "../controllers/masterGuruController.js";

const router = Router();

router.get("/", masterGuruController.getAllGuru);
router.get("/:id", masterGuruController.getGuruById);
router.post("/", masterGuruController.createGuru);
router.put("/:id", masterGuruController.updateGuru);
router.delete("/:id", masterGuruController.deleteGuru);

export default router;
