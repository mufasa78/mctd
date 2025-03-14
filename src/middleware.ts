import { defineMiddleware } from "astro:middleware";
import { createClerkClient } from "@clerk/clerk-sdk-node";

const clerk = createClerkClient({ secretKey: import.meta.env.CLERK_SECRET_KEY });

const CLERK_ISSUER = "https://fluent-gnu-44.clerk.accounts.dev";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/blog",
  "/blog/*",
  "/about",
  "/sign-in",
  "/sign-up",
  "/api/webhooks/clerk"
];

// Admin routes that require authentication
const adminRoutes = [
  "/admin",
  "/admin/*",
  "/dashboard",
  "/dashboard/*"
];

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.url);
  const path = url.pathname;

  // Allow public routes
  if (publicRoutes.some(route => {
    if (route.endsWith("*")) {
      return path.startsWith(route.slice(0, -1));
    }
    return route === path;
  })) {
    return next();
  }

  // Check if it's an admin route
  const isAdminRoute = adminRoutes.some(route => {
    if (route.endsWith("*")) {
      return path.startsWith(route.slice(0, -1));
    }
    return route === path;
  });

  if (isAdminRoute) {
    try {
      // Get session token from various possible locations
      const sessionToken = 
        context.request.headers.get('authorization')?.replace('Bearer ', '') ||
        context.cookies.get('__session')?.value ||
        context.cookies.get('__clerk_db_jwt')?.value;

      if (!sessionToken) {
        console.error('No session token found');
        return context.redirect(`/sign-in?redirect=${encodeURIComponent(path)}`);
      }

      try {
        // Get the session
        const session = await clerk.sessions.getSession(sessionToken);
        if (!session?.userId) {
          console.error('Invalid session');
          return context.redirect(`/sign-in?redirect=${encodeURIComponent(path)}`);
        }
        
        // Add user info to context
        context.locals.userId = session.userId;
        return next();
      } catch (verifyError) {
        console.error('Session verification failed:', verifyError);
        return context.redirect(`/sign-in?redirect=${encodeURIComponent(path)}`);
      }
    } catch (error) {
      console.error("Auth error:", error);
      return context.redirect(`/sign-in?redirect=${encodeURIComponent(path)}`);
    }
  }

  // For all other routes
  return next();
}); 