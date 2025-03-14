import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    slug: v.string(),
    author: v.string(),
    published: v.boolean(),
    publishedDate: v.number(),
    userId: v.string(),
    tags: v.array(v.string()),
    category: v.string(),
    featuredImage: v.optional(v.string()),
  }).index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_user", ["userId"]),
  
  comments: defineTable({
    postId: v.id("posts"),
    author: v.string(),
    content: v.string(),
    createdAt: v.string(),
    userId: v.string(),
  }).index("by_post", ["postId"])
   .index("by_user", ["userId"]),
}); 