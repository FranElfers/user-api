import { Schema, model } from "mongoose";

export interface ISyncRecord {
  table: string;
  clientId: number;
  deviceId: string;
  userId: string;
  updatedAt: number;
  serverReceivedAt: Date;
  data: Record<string, unknown>;
}

const SyncRecordSchema = new Schema<ISyncRecord>(
  {
    table: { type: String, required: true },
    clientId: { type: Number, required: true },
    deviceId: { type: String, required: true },
    userId: { type: String, required: true },
    updatedAt: { type: Number, required: true },
    serverReceivedAt: { type: Date, default: Date.now },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { collection: "sync_records" }
);

SyncRecordSchema.index({ table: 1, clientId: 1, deviceId: 1, userId: 1 }, { unique: true });
SyncRecordSchema.index({ serverReceivedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const SyncRecord = model<ISyncRecord>("SyncRecord", SyncRecordSchema);
