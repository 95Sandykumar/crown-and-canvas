/**
 * Lightweight markdown-to-HTML converter for blog posts.
 * Handles the subset of markdown commonly used in blog content.
 * No external dependencies required.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isSafeUrl(url: string): boolean {
  return /^(https?:\/\/|\/|#|mailto:)/.test(url.trim());
}

function processInline(text: string): string {
  // Escape HTML first to prevent XSS
  let result = escapeHtml(text);

  // Bold + italic
  result = result.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  // Bold
  result = result.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Italic
  result = result.replace(/\*(.*?)\*/g, "<em>$1</em>");
  // Inline code
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Images (check before links since image syntax contains link syntax)
  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_match, alt: string, src: string) => {
      const safeSrc = isSafeUrl(src) ? src : "#";
      return `<img src="${safeSrc}" alt="${alt}" class="rounded-xl my-6 w-full" loading="lazy" />`;
    }
  );
  // Links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label: string, href: string) => {
      const safeHref = isSafeUrl(href) ? href : "#";
      return `<a href="${safeHref}" class="text-royal hover:text-royal-dark underline underline-offset-2 transition-colors">${label}</a>`;
    }
  );

  return result;
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let inBlockquote = false;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        htmlParts.push(
          `<pre class="bg-charcoal text-white/90 rounded-xl p-4 overflow-x-auto my-6 text-sm leading-relaxed"><code>${escapeHtml(codeBlockContent.join("\n"))}</code></pre>`
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Close open lists if current line isn't a list item
    if (inList && !line.trim().startsWith("- ") && !line.trim().startsWith("* ")) {
      htmlParts.push("</ul>");
      inList = false;
    }
    if (inOrderedList && !/^\d+\.\s/.test(line.trim())) {
      htmlParts.push("</ol>");
      inOrderedList = false;
    }

    // Close blockquote
    if (inBlockquote && !line.trim().startsWith(">")) {
      htmlParts.push("</blockquote>");
      inBlockquote = false;
    }

    const trimmed = line.trim();

    // Empty lines
    if (trimmed === "") {
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      htmlParts.push(
        `<h3 class="font-serif text-xl font-bold text-charcoal mt-8 mb-3">${processInline(trimmed.slice(4))}</h3>`
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      htmlParts.push(
        `<h2 class="font-serif text-2xl font-bold text-charcoal mt-10 mb-4">${processInline(trimmed.slice(3))}</h2>`
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      htmlParts.push(
        `<h1 class="font-serif text-3xl font-bold text-charcoal mt-10 mb-4">${processInline(trimmed.slice(2))}</h1>`
      );
      continue;
    }

    // Horizontal rule
    if (trimmed === "---" || trimmed === "***") {
      htmlParts.push('<hr class="my-8 border-border" />');
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      if (!inBlockquote) {
        htmlParts.push(
          '<blockquote class="border-l-4 border-gold pl-4 my-6 italic text-charcoal/70">'
        );
        inBlockquote = true;
      }
      htmlParts.push(`<p class="mb-2">${processInline(trimmed.slice(2))}</p>`);
      continue;
    }

    // Unordered list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        htmlParts.push('<ul class="list-disc pl-6 my-4 space-y-2 text-charcoal/70">');
        inList = true;
      }
      htmlParts.push(`<li>${processInline(trimmed.slice(2))}</li>`);
      continue;
    }

    // Ordered list
    const orderedMatch = trimmed.match(/^(\d+)\.\s(.+)/);
    if (orderedMatch) {
      if (!inOrderedList) {
        htmlParts.push('<ol class="list-decimal pl-6 my-4 space-y-2 text-charcoal/70">');
        inOrderedList = true;
      }
      htmlParts.push(`<li>${processInline(orderedMatch[2])}</li>`);
      continue;
    }

    // Regular paragraph
    htmlParts.push(
      `<p class="text-charcoal/70 leading-relaxed mb-4">${processInline(trimmed)}</p>`
    );
  }

  // Close any open elements
  if (inList) htmlParts.push("</ul>");
  if (inOrderedList) htmlParts.push("</ol>");
  if (inBlockquote) htmlParts.push("</blockquote>");

  return htmlParts.join("\n");
}
