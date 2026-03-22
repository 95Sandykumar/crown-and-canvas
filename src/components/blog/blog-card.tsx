import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatBlogDate } from "@/lib/blog";
import type { BlogPostCard } from "@/types/blog";

interface BlogCardProps {
  readonly post: BlogPostCard;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-2xl bg-white border border-border/40 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 space-y-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs font-medium bg-cream text-charcoal/70"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl font-bold text-charcoal leading-snug group-hover:text-royal transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-charcoal/60 leading-relaxed line-clamp-2">
          {post.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-4 text-xs text-charcoal/50">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatBlogDate(post.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-royal opacity-0 group-hover:opacity-100 transition-opacity">
            Read <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
