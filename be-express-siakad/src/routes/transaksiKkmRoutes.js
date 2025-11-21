import express from "express";
import * as TransaksiKkmController from "../controllers/transaksiKkmController.js";

const router = express.Router();

router.get("/", TransaksiKkmController.getAllTransaksiKkm);
router.post("/", TransaksiKkmController.createTransaksiKkm);
router.put("/:id", TransaksiKkmController.updateTransaksiKkm);
router.delete("/:id", TransaksiKkmController.deleteTransaksiKkm);

export default router;
