import express from "express";
import {
  getAllTahunAjaran,
  getTahunAjaranById,
  addTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
} from "../controllers/masterTahunAjaranController.js";

const router = express.Router();

router.get("/", getAllTahunAjaran);
router.get("/:id", getTahunAjaranById);
router.post("/", addTahunAjaran);
router.put("/:id", updateTahunAjaran);
router.delete("/:id", deleteTahunAjaran);

export default router;
