/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CONVEX_URL: string;
  readonly PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  readonly CLERK_SECRET_KEY: string;
  readonly CLERK_WEBHOOK_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    userId?: string;
  }
} 