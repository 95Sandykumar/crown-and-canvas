import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/blog/blog-card";
import {
  getAllBlogSlugs,
  getBlogPostBySlug,
  getRelatedPosts,
  formatBlogDate,
} from "@/lib/blog";
import { markdownToHtml } from "@/lib/markdown";
import { SITE_NAME } from "@/lib/constants";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://crownandcanvas.com";

interface BlogPostPageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: [...post.tags],
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author],
      tags: [...post.tags],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image],
    },
  };
}

function ArticleJsonLd({
  post,
}: {
  readonly post: {
    readonly title: string;
    readonly description: string;
    readonly date: string;
    readonly image: string;
    readonly author: string;
    readonly slug: string;
    readonly tags: readonly string[];
  };
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: `${BASE_URL}${post.image}`,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    author: {
      "@type": "Organization",
      name: post.author,
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/portraits/renaissance-king/after.webp`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbJsonLd({ postTitle, slug }: { readonly postTitle: string; readonly slug: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${BASE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: postTitle,
        item: `${BASE_URL}/blog/${slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const contentHtml = markdownToHtml(post.content);
  const relatedPosts = getRelatedPosts(post.slug, post.tags, 3);

  return (
    <>
      <ArticleJsonLd post={post} />
      <BreadcrumbJsonLd postTitle={post.title} slug={post.slug} />

      <article className="bg-cream min-h-screen">
        {/* Hero Image */}
        <div className="relative h-[300px] sm:h-[400px] lg:h-[480px] w-full overflow-hidden">
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />

          {/* Breadcrumb */}
          <div className="absolute top-6 left-0 right-0">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
            </div>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 pb-8 sm:pb-10">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-3">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-white/20 text-white border-white/10 text-xs backdrop-blur-sm"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Meta bar */}
        <div className="border-b border-border/40 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-charcoal/60">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readingTime}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14">
          <div
            className="prose-crown max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-royal to-royal-dark text-white py-14">
          <div className="mx-auto max-w-3xl px-4 text-center space-y-5">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Ready to Create Your Pet&apos;s Royal Portrait?
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Transform your beloved pet into a majestic masterpiece. Choose from 20+ styles and get your digital proof in 24-48 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/order/upload">
                <Button
                  size="lg"
                  className="bg-gold hover:bg-gold-light text-charcoal font-semibold gap-2 px-8 py-6 text-base"
                >
                  Create Your Portrait <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/styles">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 gap-2 px-8 py-6 text-base"
                >
                  Browse Styles
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-14 sm:py-18 bg-cream">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-8 text-center">
                You Might Also Enjoy
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.slug} post={relatedPost} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
