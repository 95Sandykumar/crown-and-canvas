import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogPost, BlogPostCard } from "@/types/blog";

const BLOG_CONTENT_DIR = path.join(process.cwd(), "content", "blog");

function isValidFrontmatter(data: Record<string, unknown>): boolean {
  return (
    typeof data.title === "string" &&
    typeof data.description === "string" &&
    typeof data.date === "string" &&
    typeof data.image === "string" &&
    typeof data.author === "string" &&
    Array.isArray(data.tags)
  );
}

function parseBlogFile(slug: string, fileContent: string): BlogPost | null {
  try {
    const { data, content } = matter(fileContent);

    if (!isValidFrontmatter(data)) {
      console.error(`Invalid frontmatter in blog post: ${slug}`);
      return null;
    }

    if (data.published === false) {
      return null;
    }

    const stats = readingTime(content);

    return {
      slug,
      title: data.title as string,
      description: data.description as string,
      date: data.date as string,
      image: data.image as string,
      imageAlt: typeof data.imageAlt === "string" ? data.imageAlt : (data.title as string),
      tags: data.tags as readonly string[],
      author: data.author as string,
      authorImage: typeof data.authorImage === "string" ? data.authorImage : undefined,
      published: true,
      content,
      readingTime: stats.text,
    };
  } catch (error) {
    console.error(`Error parsing blog post ${slug}:`, error);
    return null;
  }
}

/**
 * Get all published blog posts, sorted by date (newest first).
 */
export function getAllBlogPosts(): readonly BlogPost[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const filePath = path.join(BLOG_CONTENT_DIR, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      return parseBlogFile(slug, fileContent);
    })
    .filter((post): post is BlogPost => post !== null);

  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get a single blog post by slug.
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  // Validate slug to prevent path traversal
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return null;
  }

  const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  return parseBlogFile(slug, fileContent);
}

/**
 * Get all blog post slugs (for static generation).
 */
export function getAllBlogSlugs(): readonly string[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BLOG_CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * Convert a full BlogPost to a card representation (no content).
 */
export function toPostCard(post: BlogPost): BlogPostCard {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    image: post.image,
    imageAlt: post.imageAlt,
    tags: post.tags,
    author: post.author,
    readingTime: post.readingTime,
  };
}

/**
 * Get related posts by matching tags, excluding the current post.
 */
export function getRelatedPosts(
  currentSlug: string,
  tags: readonly string[],
  limit: number = 3
): readonly BlogPostCard[] {
  const allPosts = getAllBlogPosts();

  const scored = allPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      const matchCount = post.tags.filter((tag) => tags.includes(tag)).length;
      return { post, matchCount };
    })
    .sort((a, b) => b.matchCount - a.matchCount);

  return scored.slice(0, limit).map(({ post }) => toPostCard(post));
}

/**
 * Format a date string for display.
 */
export function formatBlogDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
