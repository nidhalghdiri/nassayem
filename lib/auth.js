// app/lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

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

          // Find user
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase(),
            },
            include: {
              building: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
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
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          // const isValid = credentials.password == user.password;

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
            building: user.buildingId,
            building: user.building, // Include building object
            phone: user.phone,
            avatar: user.avatar,
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
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.buildingId = user.buildingId;
        token.building = user.building; // Add building data
        token.phone = user.phone;
        token.avatar = user.avatar;
      }
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.buildingId = token.buildingId;
        session.user.building = token.building; // Add to session
        session.user.phone = token.phone;
        session.user.avatar = token.avatar;
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
