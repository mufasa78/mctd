import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import 'dotenv/config';

interface WordPressPost {
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  slug: string;
  date: string;
  _embedded?: {
    author?: Array<{ name: string }>;
    "wp:term"?: Array<Array<{ name: string }>>;
    "wp:featuredmedia"?: Array<{ source_url: string }>;
  };
}

interface FormattedPost {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  author: string;
  publishedDate: number;
  tags: string[];
  category: string;
  featuredImage?: string;
}

const WORDPRESS_API_URL = "https://public-api.wordpress.com/wp/v2/sites/mctdwarrior.wordpress.com";
const CONVEX_URL = process.env.CONVEX_URL;

if (!CONVEX_URL) {
  throw new Error("Missing CONVEX_URL environment variable");
}

const client = new ConvexHttpClient(CONVEX_URL);

function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';
  return html.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}

function validatePost(post: FormattedPost): boolean {
  return (
    typeof post.title === 'string' &&
    typeof post.content === 'string' &&
    typeof post.excerpt === 'string' &&
    typeof post.slug === 'string' &&
    typeof post.author === 'string' &&
    typeof post.publishedDate === 'number' &&
    Array.isArray(post.tags) &&
    typeof post.category === 'string' &&
    (post.featuredImage === undefined || typeof post.featuredImage === 'string')
  );
}

function sanitizePost(post: WordPressPost): FormattedPost | null {
  try {
    const tags = post._embedded?.["wp:term"]?.[1]?.map(tag => tag.name).filter((name): name is string => typeof name === 'string') || [];
    const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name || "General";
    const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

    const formattedPost: FormattedPost = {
      title: sanitizeHtml(post.title.rendered),
      content: sanitizeHtml(post.content.rendered),
      excerpt: sanitizeHtml(post.excerpt.rendered),
      slug: post.slug,
      author: post._embedded?.author?.[0]?.name || "Wendy Gikono",
      publishedDate: new Date(post.date).getTime(),
      tags: tags,
      category: category,
      ...(featuredImage && { featuredImage }),
    };

    return validatePost(formattedPost) ? formattedPost : null;
  } catch (error) {
    console.error('Error sanitizing post:', error);
    return null;
  }
}

async function fetchAllPosts(): Promise<FormattedPost[]> {
  let page = 1;
  let allPosts: FormattedPost[] = [];
  let hasMore = true;

  while (hasMore) {
    console.log(`Fetching page ${page}...`);
    const response = await fetch(`${WORDPRESS_API_URL}/posts?_embed&page=${page}&per_page=100`);
    
    // Check if we've reached the last page
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    hasMore = page < totalPages;

    const posts = await response.json() as WordPressPost[];
    if (!Array.isArray(posts)) {
      console.log('No more posts found');
      break;
    }

    const formattedPosts = posts
      .map(sanitizePost)
      .filter((post): post is FormattedPost => post !== null);

    allPosts = [...allPosts, ...formattedPosts];
    page++;
  }

  return allPosts;
}

async function importPosts() {
  try {
    console.log("Fetching all posts from WordPress...");
    const posts = await fetchAllPosts();
    
    console.log(`Found ${posts.length} valid posts. Importing...`);
    
    // Import posts in batches to avoid overwhelming the server
    const BATCH_SIZE = 1; // Import one at a time to isolate issues
    for (let i = 0; i < posts.length; i += BATCH_SIZE) {
      const batch = posts.slice(i, i + BATCH_SIZE);
      console.log(`Importing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(posts.length / BATCH_SIZE)}...`);
      console.log('Post data:', JSON.stringify(batch, null, 2));
      
      try {
        await client.mutation(api.posts.importPosts, {
          posts: batch,
          userId: "system-import",
        });
        console.log('Successfully imported post:', batch[0].title);
      } catch (error) {
        console.error('Failed to import post:', batch[0].title);
        console.error('Error:', error);
        // Continue with next batch instead of exiting
        continue;
      }
    }
    
    console.log("Import completed!");
  } catch (error) {
    console.error("Error in import process:", error);
    process.exit(1);
  }
}

importPosts(); 