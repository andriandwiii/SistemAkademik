import express from "express";
import {
  getAllHari,
  getHariById,
  addHari,
  updateHari,
  deleteHari,
} from "../controllers/M.HariController.js";

const router = express.Router();

router.get("/", getAllHari);
router.get("/:id", getHariById);
router.post("/", addHari);
router.put("/:id", updateHari);
router.delete("/:id", deleteHari);

export default router;
