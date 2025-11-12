import express from "express";
import * as JadwalController from "../controllers/jadwalController.js";
import * as JadwalModel from "../models/jadwalModel.js";

const router = express.Router();

router.get("/", JadwalController.getAllJadwal);
router.post("/", JadwalController.createJadwal);
router.put("/:id", JadwalController.updateJadwal);
router.delete("/:id", JadwalController.deleteJadwal);

// 🔹 Opsional: cek tahun ajaran aktif
router.get("/tahun-ajaran/aktif", async (req, res) => {
  try {
    const active = await JadwalModel.getActiveTahunAjaran();
    if (!active) return res.status(404).json({ status: "01", message: "Tidak ada tahun ajaran aktif" });
    res.status(200).json({ status: "00", data: active });
  } catch (err) {
    res.status(500).json({ status: "99", message: err.message });
  }
});

export default router;
