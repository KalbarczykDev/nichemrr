import mongoose, { Schema } from "mongoose";

export interface TokenDoc {
  token: string;
  type: "email_verification" | "password_reset";
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
}

const TokenSchema = new Schema<TokenDoc>(
  {
    token: { type: String, required: true, unique: true },
    type: { type: String, enum: ["email_verification", "password_reset"], required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false }
);

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Token =
  (mongoose.models.Token as mongoose.Model<TokenDoc>) ||
  mongoose.model<TokenDoc>("Token", TokenSchema);
