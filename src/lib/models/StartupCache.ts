import mongoose, { Schema } from "mongoose";
import { Startup } from "@/lib/types";

export interface StartupCacheDoc {
  filter: "all" | "onSale";
  startups: Startup[];
  cachedAt: Date;
  count: number;
}

const startupSchema = new Schema<Startup>(
  {
    id: String,
    name: String,
    category: Schema.Types.Mixed,
    mrr: Schema.Types.Mixed,
    growth: Schema.Types.Mixed,
    customers: Schema.Types.Mixed,
    askingPrice: Schema.Types.Mixed,
    multiple: Schema.Types.Mixed,
    onSale: Boolean,
    url: String,
    description: Schema.Types.Mixed,
    createdAt: Schema.Types.Mixed,
  },
  { _id: false }
);

const startupCacheSchema = new Schema<StartupCacheDoc>(
  {
    filter: { type: String, enum: ["all", "onSale"], required: true, unique: true },
    startups: [startupSchema],
    cachedAt: { type: Date, required: true },
    count: { type: Number, required: true },
  },
  { versionKey: false }
);

export const StartupCache =
  (mongoose.models.StartupCache as mongoose.Model<StartupCacheDoc>) ||
  mongoose.model<StartupCacheDoc>("StartupCache", startupCacheSchema);
