export interface BlogPostFrontmatter {
  readonly title: string;
  readonly description: string;
  readonly date: string;
  readonly image: string;
  readonly imageAlt: string;
  readonly tags: readonly string[];
  readonly author: string;
  readonly authorImage?: string;
  readonly published: boolean;
}

export interface BlogPost extends BlogPostFrontmatter {
  readonly slug: string;
  readonly content: string;
  readonly readingTime: string;
}

export interface BlogPostCard {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly date: string;
  readonly image: string;
  readonly imageAlt: string;
  readonly tags: readonly string[];
  readonly author: string;
  readonly readingTime: string;
}
