<script lang="ts">
  import { onMount } from 'svelte';
  import { BlogService } from '$lib/services/blog.svelte.js';
  import PostCard from '$lib/components/post-card.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import type { BlogPost } from '$lib/types.js';

  let posts: BlogPost[] = $state([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      posts = await BlogService.getAllPosts();
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      loading = false;
    }
  });
</script>

<div class="space-y-6">
  <div class="mb-6 flex items-center justify-between">
    <h2 class="text-2xl font-semibold text-foreground">Latest Posts</h2>
  </div>

  {#if loading}
    <div class="py-12 text-center">
      <p class="text-muted-foreground">Loading posts...</p>
    </div>
  {:else if posts.length === 0}
    <div class="space-y-4 py-12 text-center">
      <p class="text-muted-foreground">No posts found.</p>
      <Button href="/create" size="sm">Create the First Post</Button>
    </div>
  {:else}
    <div class="divide-y divide-border rounded-lg border border-border bg-card">
      {#each posts as post (post.id)}
        <PostCard {post} />
      {/each}
    </div>
  {/if}
</div>
