import express from "express";
import {
  getAllMataPelajaran,
  getMataPelajaranById,
  addMataPelajaran,
  updateMataPelajaran,
  deleteMataPelajaran,
} from "../controllers/masterMataPelajaranController.js";

const router = express.Router();

router.get("/", getAllMataPelajaran);
router.get("/:id", getMataPelajaranById);
router.post("/", addMataPelajaran);
router.put("/:id", updateMataPelajaran);
router.delete("/:id", deleteMataPelajaran);

export default router;
