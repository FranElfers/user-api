import { Request, Response, Router } from "express";
import { getRipteVariation } from '../indexes/ripte';
import { getIPCVariation } from '../indexes/ipc';
import { getIndexByMonth, upsertIndexValue, getAllIndexes } from '../queries/indexQueries';

const router = Router();

// function makeIndexHandler(indexName: string, scrape: () => Promise<{ value: number; date: Date }>) {
//   return async (req: Request, res: Response) => {
//     try {
//       const now = new Date();
//       const label = `[${indexName}]`;

//       const existing = await getIndexByMonth(indexName, now);
//       if (existing) {
//         console.log(`${label} Cache hit for ${now.getFullYear()}-${now.getMonth() + 1} — skipping scrape`);
//         return res.json({ variation: existing.value, date: `${existing.date.getFullYear()}-${existing.date.getMonth() + 1}-${existing.date.getDate()}` });
//       }

//       console.log(`${label} No record for ${now.getFullYear()}-${now.getMonth() + 1} — starting scrape`);
//       const { value: variation, date } = await scrape();

//       if (variation === null) {
//         console.warn(`${label} Scrape returned null — value not saved`);
//         return res.status(502).json({ message: `Could not parse ${indexName} variation` });
//       }

//       const saved = await upsertIndexValue(indexName, date, variation, "scraper");
//       console.log(`${label} Saved variation ${variation} to DB`);

//       res.json({ value: variation, date: `${saved.date.getFullYear()}-${saved.date.getMonth() + 1}-${saved.date.getDate()}` });
//     } catch (error) {
//       console.error(`[${indexName}] Unexpected error:`, error);
//       res.status(500).json({ status: "error" });
//     }
//   };
// }

// router.get("/index/ripte", makeIndexHandler("RIPTE", getRipteVariation));
// router.get("/index/ipc", makeIndexHandler("IPC", getIPCVariation));

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