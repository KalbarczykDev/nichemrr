import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/lib/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user || !user.passwordHash) return null;
        if (!user.emailVerified) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user._id.toString(), email: user.email };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        const email = user.email!.toLowerCase();
        const existing = await User.findOne({ email });
        if (!existing) {
          await User.create({
            email,
            passwordHash: null,
            emailVerified: true,
            provider: "google",
            image: user.image ?? undefined,
            tosAcceptedAt: new Date(),
          });
        } else if (existing.provider === "credentials") {
          await User.updateOne({ email }, { emailVerified: true, image: user.image });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      // For Google, look up the user id if not yet stored
      if (!token.userId && token.email) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: token.email.toLowerCase() });
        if (dbUser) token.userId = dbUser._id.toString();
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
};
