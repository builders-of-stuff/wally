<script lang="ts">
  import type { BlogPost } from '$lib/types.js';
  import { Button } from '$lib/components/ui/button/index.js';

  let { post }: { post: BlogPost } = $props();

  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  }
</script>

<article
  class="flex gap-4 p-4 transition-colors hover:bg-muted/50"
>
  <!-- Voting placeholder -->
  <div class="flex flex-col items-center gap-1 text-sm text-muted-foreground">
    <button class="hover:text-primary transition-colors">▲</button>
    <span class="font-medium">42</span>
    <button class="hover:text-primary transition-colors">▼</button>
  </div>

  <!-- Content -->
  <div class="flex-1 min-w-0">
    <div class="mb-2">
      <h2 class="text-lg font-medium text-card-foreground mb-1">
        <a href="/post/{post.id}" class="transition-colors hover:text-primary">
          {post.title}
        </a>
      </h2>

      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <span>by {post.author.slice(0, 6)}...{post.author.slice(-4)}</span>
        <span>•</span>
        <span>{formatDate(post.publishedAt)}</span>
        <span>•</span>
        <a href="/post/{post.id}" class="hover:underline">3 comments</a>
      </div>
    </div>

    <p class="text-sm text-muted-foreground line-clamp-2">
      {truncateText(post.body, 150)}
    </p>
  </div>
</article>
