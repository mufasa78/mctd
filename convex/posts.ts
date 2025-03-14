import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";

export const getAllPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("published"), true))
      .order("desc")
      .collect();
    return posts;
  },
});

export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .collect();
    return posts[0];
  },
});

interface CreatePostArgs {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  author: string;
  tags: string[];
  category: string;
}

export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    slug: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
    category: v.string(),
  },
  handler: async (ctx, args: CreatePostArgs) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const postId = await ctx.db.insert("posts", {
      ...args,
      userId: identity.subject,
      publishedDate: Date.now(),
      published: true,
    });
    return postId;
  },
});

export const deletePost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const importPosts = mutation({
  args: {
    posts: v.array(
      v.object({
        title: v.string(),
        content: v.string(),
        excerpt: v.string(),
        slug: v.string(),
        author: v.string(),
        publishedDate: v.number(),
        tags: v.array(v.string()),
        category: v.string(),
        featuredImage: v.optional(v.string()),
      })
    ),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { posts, userId } = args;

    // Import each post
    const importedPosts = await Promise.all(
      posts.map(async (post) => {
        const existingPost = await ctx.db
          .query("posts")
          .withIndex("by_slug", (q) => q.eq("slug", post.slug))
          .first();

        if (existingPost) {
          // Update existing post
          return await ctx.db.patch(existingPost._id, {
            ...post,
            userId,
            published: true,
          });
        } else {
          // Create new post
          return await ctx.db.insert("posts", {
            ...post,
            userId,
            published: true,
          });
        }
      })
    );

    return importedPosts;
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("posts").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!post) {
      throw new ConvexError("Post not found");
    }

    return post;
  },
});

export const getPublished = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    slug: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
    category: v.string(),
    featuredImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.insert("posts", {
      ...args,
      userId: identity.subject,
      published: false,
      publishedDate: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    slug: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
    category: v.string(),
    featuredImage: v.optional(v.string()),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new ConvexError("Post not found");
    }

    if (existing.userId !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new ConvexError("Post not found");
    }

    if (existing.userId !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
}); 