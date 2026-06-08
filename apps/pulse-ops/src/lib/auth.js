import Credentials from "next-auth/providers/credentials";

// Export authOptions for use by the NextAuth route handler
export const authOptions = {
    session: { strategy: "jwt" },

    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                staffId: { label: "Staff ID", type: "text" },
                password: { label: "Password", type: "password" }
            },

            async authorize(credentials) {
                try {
                    const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
                    const res = await fetch(`${API_GATEWAY}/pulse-ops/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            staffId: credentials.staffId,
                            password: credentials.password
                        })
                    });

                    if (!res.ok) return null;

                    const user = await res.json();

                    return {
                        id: user.staffId,
                        staffId: user.staffId,
                        name: user.name,
                        role: user.role
                    };
                } catch (err) {
                    console.error("NextAuth authorize failed:", err);
                    return null;
                }
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.staffId = user.staffId;
                token.role = user.role;
            }
            return token;
        },

        async session({ session, token }) {
            session.user = session.user || {};
            session.user.staffId = token.staffId;
            session.user.role = token.role;
            return session;
        }
    },

    pages: { signIn: "/login" }
};

export default authOptions;