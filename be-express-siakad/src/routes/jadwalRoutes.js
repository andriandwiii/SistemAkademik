import express from "express";
import * as JadwalController from "../controllers/jadwalController.js";

const router = express.Router();

router.get("/", JadwalController.getAllJadwal);
router.post("/", JadwalController.createJadwal);
router.put("/:id", JadwalController.updateJadwal);
router.delete("/:id", JadwalController.deleteJadwal);

export default router;