import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth({
  ...authOptions,
  // Set trustHost for production deployment
  useSecureCookies: process.env.NODE_ENV === "production",
});

export { handler as GET, handler as POST };

// Add environment variable support for NextAuth
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
