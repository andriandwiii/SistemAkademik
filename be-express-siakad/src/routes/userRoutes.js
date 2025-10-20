import express from "express";
import { fetchAllUsers, createNewUser, updateUserController, deleteUserController, getUserByIdController } from "../controllers/userController.js";
import { verifyToken, authorizeRoles } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", verifyToken, authorizeRoles("SUPER_ADMIN", "KESISWAAN"), fetchAllUsers);
router.get("/:id", verifyToken, authorizeRoles("SUPER_ADMIN"), getUserByIdController);
router.post("/", verifyToken, authorizeRoles("SUPER_ADMIN"), createNewUser);
router.put("/:id", verifyToken, authorizeRoles("SUPER_ADMIN"), updateUserController);
router.delete("/:id", verifyToken, authorizeRoles("SUPER_ADMIN"), deleteUserController);

export default router;
