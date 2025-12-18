// app/api/auth/[...nextauth]/route.js
import NextAuth, { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// IMPORTANT: Don't use the adapter with credentials provider unless you're using database sessions
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("Input credentials: ", credentials);
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password required");
          }

          console.log(
            "Looking for user with email:",
            credentials.email.toLowerCase()
          );
          console.log(
            "Available prisma.user fields:",
            Object.keys(prisma.user.fields)
          );

          // Find user
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase(),
            },
          });
          console.log("Founded User: ", user);

          if (!user) {
            console.error("No user found with email:", credentials.email);
            return null;
          }

          if (!user.password) {
            console.error("User has no password set");
            return null;
          }

          // Verify password
          // const isValid = await bcrypt.compare(
          //   credentials.password,
          //   user.password
          // );
          const isValid = credentials.password == user.password;

          if (!isValid) {
            console.error("Invalid password for user:", credentials.email);
            return null;
          }

          // Return user object (excluding password)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/en/login",
    signOut: "/",
    error: "/en/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt", // Make sure JWT is used
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
