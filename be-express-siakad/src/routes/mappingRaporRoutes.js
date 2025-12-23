import express from "express";
import * as MappingController from "../controllers/mappingRaporController.js";

const router = express.Router();

router.get("/", MappingController.getAll);
router.get("/:id", MappingController.getById);
router.post("/", MappingController.create);
router.put("/:id", MappingController.update);
router.post("/bulk", MappingController.saveBulk);
router.delete("/:id", MappingController.remove);

export default router;