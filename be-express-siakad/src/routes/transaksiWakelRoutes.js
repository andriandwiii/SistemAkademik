import express from "express";
import * as TransaksiController from "../controllers/transaksiWakelController.js";

const router = express.Router();

router.get("/", TransaksiController.getAllTransaksi);
router.post("/", TransaksiController.createTransaksi);
router.put("/:id", TransaksiController.updateTransaksi);
router.delete("/:id", TransaksiController.deleteTransaksi);

export default router;