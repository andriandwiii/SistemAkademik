import express from "express";
import * as MasterHariController from "../controllers/masterHariController.js";

const router = express.Router();

// Ambil semua hari
router.get("/", MasterHariController.getAllHari);

// Ambil hari by ID
router.get("/:id", MasterHariController.getHariById);

// Tambah hari
router.post("/", MasterHariController.createHari);

// Update hari
router.put("/:id", MasterHariController.updateHari);

// Hapus hari
router.delete("/:id", MasterHariController.deleteHari);

export default router;
