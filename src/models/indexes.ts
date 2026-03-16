import { Schema, model } from "mongoose";

function argentinaNow(): Date {
  const argentinaTime = new Date().toLocaleString("en-US", {
    timeZone: "America/Argentina/Buenos_Aires"
  });
  return new Date(argentinaTime);
}

export interface IIndex {
  index: string;
  date: Date;
  value: number;
  source: string;
}

const IndexSchema = new Schema<IIndex>(
  {
    index: { type: String, required: true },
    date: { type: Date, required: true },
    value: { type: Number, required: true },
    source: { type: String, required: true }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
      currentTime: argentinaNow
    }
  }
);

// Compound index: efficient queries by index+date and uniqueness per month
IndexSchema.index({ index: 1, date: 1 }, { unique: true });

export const Index = model<IIndex>("Index", IndexSchema, "indexes");
