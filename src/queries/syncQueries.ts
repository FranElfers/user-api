import { Response } from "express";
import { z } from "zod";
import { SyncRecord } from "../models/syncRecord";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const PushBodySchema = z.object({
  records: z.array(
    z.object({
      table: z.string(),
      device_id: z.string(),
      data: z.record(z.string(), z.unknown()),
    })
  ),
});

const PullBodySchema = z.object({
  last_sync: z.number(),
  tables: z.array(z.string()),
});

export const pushRecords = async (req: AuthenticatedRequest, res: Response) => {
  const contentLength = req.headers["content-length"];
  console.log(`[sync/push] userId=${req.actualUserId} contentLength=${contentLength ?? "unknown"} bytes`);

  const parsed = PushBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid body", errors: parsed.error.issues });
  }

  const { records } = parsed.data;

  let pushed = 0;
  let skipped = 0;
  const userId = req.actualUserId!;

  for (const record of records) {
    const raw = record.data as { id?: number; updated_at?: number;[key: string]: unknown };

    if (raw.id == null) {
      console.warn(`[sync/push] Missing "id" in record for table "${record.table}", skipping`);
      skipped++;
      continue;
    }

    const clientId = raw.id;
    const remoteUpdatedAt = raw.updated_at ?? 0;

    try {
      const existing = await SyncRecord.findOne({ table: record.table, clientId, deviceId: record.device_id, userId });

      if (!existing) {
        await SyncRecord.create({
          table: record.table,
          clientId,
          deviceId: record.device_id,
          userId,
          updatedAt: remoteUpdatedAt,
          serverReceivedAt: new Date(),
          data: record.data,
        });
        pushed++;
      } else if (remoteUpdatedAt > existing.updatedAt) {
        await SyncRecord.updateOne(
          { _id: existing._id },
          {
            $set: {
              updatedAt: remoteUpdatedAt,
              serverReceivedAt: new Date(),
              data: record.data,
            },
          }
        );
        pushed++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`[sync/push] Error on table "${record.table}", clientId ${clientId}:`, error);
      skipped++;
    }
  }

  res.status(200).json({ pushed, skipped });
};

export const pullRecords = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = PullBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid body", errors: parsed.error.issues });
  }

  const { last_sync, tables } = parsed.data;

  const userId = req.actualUserId!;
  const records: Array<{ table: string; device_id: string; data: Record<string, unknown> }> = [];

  try {
    for (const table of tables) {
      const query = last_sync === 0
        ? { table, userId }
        : { table, userId, updatedAt: { $gt: last_sync } };
      const docs = await SyncRecord.find(query).lean();

      for (const doc of docs) {
        records.push({
          table: doc.table,
          device_id: doc.deviceId,
          data: doc.data,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching records", error });
  }

  res.status(200).json({ records });
};
