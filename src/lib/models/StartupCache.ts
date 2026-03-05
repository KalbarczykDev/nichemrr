import mongoose, { Schema } from "mongoose";
import { Startup } from "@/lib/types";

export interface StartupCacheDoc extends Startup {
  cachedAt: Date;
}

const startupCacheSchema = new Schema<StartupCacheDoc>(
  {
    id: { type: String, required: true, unique: true },
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
    cachedAt: { type: Date, required: true },
  },
  { versionKey: false }
);

export const StartupCache =
  (mongoose.models.StartupCache as mongoose.Model<StartupCacheDoc>) ||
  mongoose.model<StartupCacheDoc>("StartupCache", startupCacheSchema);
