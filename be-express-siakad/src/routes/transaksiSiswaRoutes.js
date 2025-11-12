import express from "express";
import * as MasterKKMController from "../controllers/masterKKMController.js";

const router = express.Router();

router.get("/", MasterKKMController.getAllKKM);
router.post("/", MasterKKMController.createKKM);
router.put("/:id", MasterKKMController.updateKKM);
router.delete("/:id", MasterKKMController.deleteKKM);

export default router;
