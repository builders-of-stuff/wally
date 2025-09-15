<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { BlogService } from '$lib/services/blog.svelte.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import type { BlogPost } from '$lib/types.js';

  let post: BlogPost | null = $state(null);
  let loading = $state(true);
  let notFound = $state(false);

  onMount(async () => {
    const postId = page.params.id;
    if (!postId) {
      notFound = true;
      loading = false;
      return;
    }

    try {
      const fetchedPost = await BlogService.getPost(postId);
      if (fetchedPost) {
        post = fetchedPost;
      } else {
        notFound = true;
      }
    } catch (error) {
      console.error('Failed to load post:', error);
      notFound = true;
    } finally {
      loading = false;
    }
  });

  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async function handleDelete() {
    if (!post || !confirm('Are you sure you want to delete this post?')) return;

    try {
      const success = await BlogService.deletePost(post.id);
      if (success) {
        goto('/');
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  }
</script>

<svelte:head>
  <title>{post?.title || 'Post Not Found'} - Wally Blog</title>
</svelte:head>

{#if loading}
  <div class="py-12 text-center">
    <p class="text-muted-foreground">Loading post...</p>
  </div>
{:else if notFound || !post}
  <div class="space-y-4 py-12 text-center">
    <h1 class="text-2xl font-bold text-foreground">Post Not Found</h1>
    <p class="text-muted-foreground">The post you're looking for doesn't exist.</p>
    <Button href="/" variant="outline">Back to Home</Button>
  </div>
{:else}
  <article class="mx-auto max-w-4xl">
    <div class="mb-8">
      <Button href="/" variant="outline" size="sm">← Back to Posts</Button>
    </div>

    <header class="mb-8">
      <h1 class="mb-4 text-4xl font-bold text-foreground">{post.title}</h1>

      <div
        class="flex flex-wrap items-center justify-between gap-4 text-muted-foreground"
      >
        <div class="flex items-center gap-4 text-sm">
          <span>By {post.author.slice(0, 8)}...{post.author.slice(-6)}</span>
          <span>•</span>
          <span>Published {formatDate(post.publishedAt)}</span>
          {#if post.updatedAt}
            <span>•</span>
            <span>Updated {formatDate(post.updatedAt)}</span>
          {/if}
        </div>

        <div class="flex gap-2">
          <Button href="/edit/{post.id}" variant="outline" size="sm">Edit</Button>
          <Button onclick={handleDelete} variant="destructive" size="sm">Delete</Button>
        </div>
      </div>
    </header>

    <div class="prose prose-gray dark:prose-invert max-w-none">
      <div class="leading-relaxed whitespace-pre-wrap text-foreground">
        {post.body}
      </div>
    </div>

    <div class="mt-12 border-t border-border pt-8">
      <div class="flex items-center justify-between">
        <Button href="/" variant="outline">← Back to Posts</Button>
        <Button href="/create">Write Another Post</Button>
      </div>
    </div>
  </article>
{/if}
