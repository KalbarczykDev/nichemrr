import mongoose, { Schema } from "mongoose";

export interface UserDoc {
  email: string;
  passwordHash: string | null;
  emailVerified: boolean;
  provider: "credentials" | "google";
  image?: string;
  tosAcceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    provider: { type: String, enum: ["credentials", "google"], required: true },
    image: { type: String },
    tosAcceptedAt: { type: Date, default: null },
  },
  { versionKey: false, timestamps: true }
);

export const User =
  (mongoose.models.User as mongoose.Model<UserDoc>) ||
  mongoose.model<UserDoc>("User", UserSchema);
