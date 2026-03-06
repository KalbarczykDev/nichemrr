import mongoose, { Schema } from "mongoose";

export interface UserSettingsDoc {
  userId: string;
  theme: "light" | "dark" | "system";
}

const UserSettingsSchema = new Schema<UserSettingsDoc>(
  {
    userId: { type: String, required: true, unique: true },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
  },
  { versionKey: false, timestamps: true }
);

export const UserSettings =
  (mongoose.models.UserSettings as mongoose.Model<UserSettingsDoc>) ||
  mongoose.model<UserSettingsDoc>("UserSettings", UserSettingsSchema);
