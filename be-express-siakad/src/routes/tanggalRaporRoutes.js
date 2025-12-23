import express from "express";
import * as Ctrl from "../controllers/tanggalRaporController.js";

const router = express.Router();

router.get("/", Ctrl.getTanggalRapor);
router.get("/preview", Ctrl.getPreviewTtd); // Endpoint untuk tampilan gambar 71
router.post("/", Ctrl.saveTanggalRapor);
router.put("/:id", Ctrl.updateTanggalRapor);
router.delete("/:id", Ctrl.deleteTanggalRapor);

export default router;