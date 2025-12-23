import express from "express";
import * as BukuIndukCtrl from "../controllers/bukuIndukController.js";

const router = express.Router();

// Endpoint untuk menarik seluruh data Raport / Buku Induk
router.get("/generate", BukuIndukCtrl.getFullDataBukuInduk);

// Endpoint untuk menarik seluruh data Raport / Buku Induk
router.get("/generate-guru", BukuIndukCtrl.getFullDataBukuInduk);

// Endpoint untuk menarik seluruh data Raport / Buku Induk
router.get("/generate-siswa", BukuIndukCtrl.getFullDataBukuInduk);

export default router;