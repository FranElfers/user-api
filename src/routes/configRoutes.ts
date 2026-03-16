import { Router } from "express";
import { getRipteVariation } from '../scrappers/ripte';
import { getIndexByMonth, upsertIndexValue } from '../queries/indexQueries';

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.get("/index/ripte", async (req, res) => {
  try {
    const now = new Date();

    const existing = await getIndexByMonth("RIPTE", now);
    if (existing) {
      console.log(`[RIPTE] Cache hit for ${now.getFullYear()}-${now.getMonth() + 1} — skipping scrape`);
      return res.json({ variation: existing.value, source: "db" });
    }

    console.log(`[RIPTE] No record for ${now.getFullYear()}-${now.getMonth() + 1} — starting scrape`);
    const variation = await getRipteVariation();

    if (variation === null) {
      console.warn("[RIPTE] Scrape returned null — value not saved");
      return res.status(502).json({ message: "Could not parse RIPTE variation" });
    }

    await upsertIndexValue("RIPTE", now, variation, "scraper");
    console.log(`[RIPTE] Saved variation ${variation} to DB`);

    res.json({ variation, source: "scraper" });
  } catch (error) {
    console.error("[RIPTE] Unexpected error:", error);
    res.status(500).json({ status: "error" });
  }
});

export default router;