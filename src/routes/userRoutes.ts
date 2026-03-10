import { Router } from "express";
import { getUserById, createUser, updateUser, deleteUser } from "../queries/userQueries";
import { authMiddleware } from "../middleware/authMiddleware";


const router = Router();

router.get("/users", authMiddleware, getUserById);
router.post("/admin/users", authMiddleware, createUser);
router.put("/admin/users/:id", authMiddleware, updateUser);
router.delete("/admin/users/:id", authMiddleware, deleteUser);

export default router;