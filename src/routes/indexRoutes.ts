import { Request, Response, Router } from "express";
import { getAllIndexes } from '../queries/indexQueries';

const router = Router();

router.get("/index/all", async (req: Request, res: Response) => {
  try {
    const grouped = await getAllIndexes();
    const result = Object.entries(grouped).map(([name, docs]) => ({
      name,
      variations: docs.map(doc => ({
        date: `${doc.date.getFullYear()}-${doc.date.getMonth() + 1}-${doc.date.getDate()}`,
        value: doc.value
      }))
    }));
    res.json(result);
  } catch (error) {
    console.error("[/index/all] Unexpected error:", error);
    res.status(500).json({ status: "error" });
  }
});

export default router;