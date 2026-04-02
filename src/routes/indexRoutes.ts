import { Request, Response, Router } from "express";
import { getIndexByMonth, upsertIndexValue, getAllIndexes, deleteIndexByMonth } from '../queries/indexQueries';
import { authMiddleware, authorizeAdmin } from '../middleware/authMiddleware';

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

router.post("/admin/indexes", authMiddleware, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const { index, date, value } = req.body;

    if (!index || !date || value === undefined) {
      return res.status(400).json({ message: "Missing required fields: index, date, value" });
    }

    if (typeof value !== "number") {
      return res.status(400).json({ message: "Value must be a number" });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const saved = await upsertIndexValue(index, dateObj, value, "admin");
    res.status(201).json({
      index: saved.index,
      date: `${saved.date.getFullYear()}-${saved.date.getMonth() + 1}-${saved.date.getDate()}`,
      value: saved.value
    });
  } catch (error) {
    console.error("[POST /admin/indexes] Unexpected error:", error);
    res.status(500).json({ status: "error" });
  }
});

router.put("/admin/indexes/:index/:date", authMiddleware, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const index = req.params.index as string;
    const date = req.params.date as string;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ message: "Missing required field: value" });
    }

    if (typeof value !== "number") {
      return res.status(400).json({ message: "Value must be a number" });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const updated = await upsertIndexValue(index, dateObj, value, "admin");
    res.json({
      index: updated.index,
      date: `${updated.date.getFullYear()}-${updated.date.getMonth() + 1}-${updated.date.getDate()}`,
      value: updated.value
    });
  } catch (error) {
    console.error("[PUT /admin/indexes] Unexpected error:", error);
    res.status(500).json({ status: "error" });
  }
});

router.delete("/admin/indexes/:index/:date", authMiddleware, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const index = req.params.index as string;
    const date = req.params.date as string;

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const deleted = await deleteIndexByMonth(index, dateObj);
    if (!deleted) {
      return res.status(404).json({ message: "Index not found" });
    }

    res.json({ message: `Index ${index} on ${date} deleted successfully` });
  } catch (error) {
    console.error("[DELETE /admin/indexes] Unexpected error:", error);
    res.status(500).json({ status: "error" });
  }
});

export default router;