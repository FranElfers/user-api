import { Router } from "express";
import { getUserById, createUser, updateUser, deleteUser } from "../queries/userQueries";
import { authMiddleware, authorizeAdmin } from "../middleware/authMiddleware";


const router = Router();

router.get("/users", authMiddleware, getUserById);
router.post("/admin/users", authMiddleware, authorizeAdmin, createUser);
router.put("/admin/users/:id", authMiddleware, authorizeAdmin, updateUser);
router.delete("/admin/users/:id", authMiddleware, authorizeAdmin, deleteUser);

export default router;