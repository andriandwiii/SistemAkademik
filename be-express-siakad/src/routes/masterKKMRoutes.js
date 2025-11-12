import express from "express";
import {
  getAllKKM,
  createKKM,
  updateKKM,
  deleteKKM,
} from "../controllers/masterKKMController.js";

const router = express.Router();

router.get("/", getAllKKM);
router.post("/", createKKM);
router.put("/:id", updateKKM);
router.delete("/:id", deleteKKM);

export default router;
