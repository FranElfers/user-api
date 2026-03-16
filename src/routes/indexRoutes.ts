import { Request, Response, Router } from "express";
import { getRipteVariation } from '../scrappers/ripte';
import { getIPCVariation } from '../scrappers/ipc';
import { getIndexByMonth, upsertIndexValue } from '../queries/indexQueries';

const router = Router();

function makeIndexHandler(indexName: string, scrape: () => Promise<number | null>) {
  return async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const label = `[${indexName}]`;

      const existing = await getIndexByMonth(indexName, now);
      if (existing) {
        console.log(`${label} Cache hit for ${now.getFullYear()}-${now.getMonth() + 1} — skipping scrape`);
        return res.json({ variation: existing.value, source: "db" });
      }

      console.log(`${label} No record for ${now.getFullYear()}-${now.getMonth() + 1} — starting scrape`);
      const variation = await scrape();

      if (variation === null) {
        console.warn(`${label} Scrape returned null — value not saved`);
        return res.status(502).json({ message: `Could not parse ${indexName} variation` });
      }

      await upsertIndexValue(indexName, now, variation, "scraper");
      console.log(`${label} Saved variation ${variation} to DB`);

      res.json({ variation, source: "scraper" });
    } catch (error) {
      console.error(`[${indexName}] Unexpected error:`, error);
      res.status(500).json({ status: "error" });
    }
  };
}

router.get("/index/ripte", makeIndexHandler("RIPTE", getRipteVariation));
router.get("/index/ipc", makeIndexHandler("IPC", getIPCVariation));

export default router;