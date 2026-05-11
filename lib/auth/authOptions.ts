import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {
    getUserProfileByEmail,
    signInWithSupabase,
    verifySupabaseOtpToken,
} from "@/lib/supabase/portal";

function toNextAuthUser(profile: Awaited<ReturnType<typeof getUserProfileByEmail>>) {
    if (!profile) return null;
    return {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        companyId: profile.companyId || "",
        role: profile.role || "prospect",
        mustChangePassword: Boolean(profile.mustChangePassword),
    };
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "your@email.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                const profile = await signInWithSupabase(credentials.email, credentials.password);
                return toNextAuthUser(profile);
            },
        }),
        CredentialsProvider({
            id: "magic-link",
            name: "Magic Link",
            credentials: {
                token: { label: "Magic Token", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.token) return null;
                const profile = await verifySupabaseOtpToken(credentials.token);
                return toNextAuthUser(profile);
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                const email = user.email || (profile as any)?.email;
                if (!email) return false;
                const portalProfile = await getUserProfileByEmail(email);
                if (!portalProfile) return false;
                user.id = portalProfile.id;
                (user as any).firstName = portalProfile.firstName || "";
                (user as any).lastName = portalProfile.lastName || "";
                (user as any).companyId = portalProfile.companyId || "";
                (user as any).role = portalProfile.role || "prospect";
                (user as any).mustChangePassword = Boolean(portalProfile.mustChangePassword);
            }

            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session) {
                const s = session as any;
                if (s.firstName !== undefined) token.firstName = s.firstName;
                if (s.lastName !== undefined) token.lastName = s.lastName;
                return { ...token };
            }
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
                token.companyId = (user as any).companyId;
                token.role = (user as any).role;
                token.portalMode = "prospect";
                token.mustChangePassword = (user as any).mustChangePassword || false;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).email = token.email;
                (session.user as any).firstName = token.firstName;
                (session.user as any).lastName = token.lastName;

                const firstName = String(token.firstName || "");
                const lastName = String(token.lastName || "");
                session.user.name = [firstName, lastName].filter(Boolean).join(" ")
                    || (token.email ? String(token.email).split("@")[0] : "User");

                (session.user as any).companyId = token.companyId;
                (session.user as any).role = token.role;
                (session.user as any).portalMode = token.portalMode;
                (session.user as any).mustChangePassword = token.mustChangePassword;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 90 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
};
