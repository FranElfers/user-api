import { Router } from "express";
import { pushRecords, pullRecords } from "../queries/syncQueries";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/sync/push", authMiddleware, pushRecords);
router.post("/sync/pull", authMiddleware, pullRecords);

export default router;
