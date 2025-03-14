import { v } from "convex/values";
import { ConvexError } from "convex/values";

interface UserAuth {
  subject: string;
  tokenIdentifier: string;
}

export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL || "https://clerk.mctdwarrior.com",
      applicationID: "convex",
    },
  ],
  roles: ["admin", "user"],
  getPermissions: async (userAuth: UserAuth | null) => {
    if (!userAuth) {
      return { role: null };
    }
    // You can customize this based on your user data from Clerk
    return {
      role: "user",
      userId: userAuth.subject,
    };
  },
}; 