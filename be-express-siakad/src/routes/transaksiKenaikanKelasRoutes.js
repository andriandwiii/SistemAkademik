// File: routes/transaksiKenaikanKelasRoutes.js
import express from "express";
import {
  prosesKenaikanRombelController,
  getRiwayatKenaikanKelasController,
  deleteRiwayatKenaikanController,
  getRiwayatByNISController,
} from "../controllers/transaksiKenaikanKelasController.js";

const router = express.Router();

router.get("/", getRiwayatKenaikanKelasController);
router.get("/siswa/:nis", getRiwayatByNISController);
router.post("/", prosesKenaikanRombelController);
router.delete("/:id", deleteRiwayatKenaikanController);

export default router;
