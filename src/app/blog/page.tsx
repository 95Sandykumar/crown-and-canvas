import { Crown, BookOpen } from "lucide-react";
import { getAllBlogPosts, toPostCard } from "@/lib/blog";
import { BlogCard } from "@/components/blog/blog-card";
import { SITE_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: `Pet portrait tips, gift ideas, and behind-the-scenes stories from ${SITE_NAME}. Learn about AI pet portraits, custom portrait gifts, and more.`,
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: `Pet portrait tips, gift ideas, and behind-the-scenes stories from ${SITE_NAME}.`,
    type: "website",
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();
  const postCards = posts.map(toPostCard);

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-royal to-royal-dark text-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-gold" />
            <BookOpen className="h-7 w-7 text-gold/80" />
          </div>
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">
            The Royal Blog
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/70">
            Tips, stories, and inspiration for pet portrait lovers. Learn about AI pet art,
            find the perfect gift, and go behind the scenes of our process.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {postCards.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {postCards.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <BookOpen className="h-12 w-12 text-charcoal/20 mx-auto" />
              <p className="text-charcoal/50 text-lg">
                Blog posts coming soon. Stay tuned!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
