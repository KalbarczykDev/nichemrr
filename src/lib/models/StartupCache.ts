import mongoose, { Schema } from "mongoose";
import { Startup } from "@/lib/types";

export interface StartupCacheDoc extends Startup {
  cachedAt: Date;
}

const startupCacheSchema = new Schema<StartupCacheDoc>(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    icon: Schema.Types.Mixed,
    description: Schema.Types.Mixed,
    website: Schema.Types.Mixed,
    url: String,
    country: Schema.Types.Mixed,
    foundedDate: Schema.Types.Mixed,
    category: Schema.Types.Mixed,
    paymentProvider: Schema.Types.Mixed,
    targetAudience: Schema.Types.Mixed,
    mrr: Schema.Types.Mixed,
    revenueLastMonth: Schema.Types.Mixed,
    revenueTotal: Schema.Types.Mixed,
    customers: Schema.Types.Mixed,
    activeSubscriptions: Schema.Types.Mixed,
    askingPrice: Schema.Types.Mixed,
    profitMarginLast30Days: Schema.Types.Mixed,
    growth: Schema.Types.Mixed,
    multiple: Schema.Types.Mixed,
    onSale: Boolean,
    firstListedForSaleAt: Schema.Types.Mixed,
    xHandle: Schema.Types.Mixed,
    cachedAt: { type: Date, required: true },
  },
  { versionKey: false }
);

export const StartupCache =
  (mongoose.models.StartupCache as mongoose.Model<StartupCacheDoc>) ||
  mongoose.model<StartupCacheDoc>("StartupCache", startupCacheSchema);
