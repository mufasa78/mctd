import type { APIRoute } from "astro";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/backend";

const webhookSecret = import.meta.env.CLERK_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
  const payload = await request.text();
  const headers = request.headers;

  // Get the Svix headers for verification
  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");

  // If there are missing Svix headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;

  try {
    // Verify the webhook payload
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  const data = evt.data;

  console.log(`Webhook received! Event type: ${eventType}`);

  switch (eventType) {
    case "user.created":
      // Handle user creation
      console.log("New user created:", data.id);
      break;

    case "user.updated":
      // Handle user update
      console.log("User updated:", data.id);
      break;

    case "user.deleted":
      // Handle user deletion
      console.log("User deleted:", data.id);
      break;

    case "session.created":
      // Handle session creation
      console.log("New session created:", data.id);
      break;

    case "session.ended":
      // Handle session end
      console.log("Session ended:", data.id);
      break;

    default:
      console.log("Unhandled webhook event type:", eventType);
  }

  return new Response(JSON.stringify({ message: "Webhook processed successfully" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}; 