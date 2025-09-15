<script lang="ts">
  import { onMount } from 'svelte';
  import { BlogService } from '$lib/services/blog.svelte.js';
  import PostCard from '$lib/components/post-card.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import type { BlogPost } from '$lib/types.js';

  let posts: BlogPost[] = $state([]);
  let loading = $state(true);

  const currentUser = '0x1234567890abcdef';

  onMount(async () => {
    try {
      posts = await BlogService.getPostsByAuthor(currentUser);
    } catch (error) {
      console.error('Failed to load user posts:', error);
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>My Profile - Wally Blog</title>
</svelte:head>

<div class="space-y-8">
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">My Profile</h1>
        <p class="text-muted-foreground">
          Author: {currentUser.slice(0, 12)}...{currentUser.slice(-8)}
        </p>
      </div>
      <Button href="/create">Create New Post</Button>
    </div>
  </div>

  <div class="border-t border-border pt-8">
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-foreground">Your Posts</h2>
      <p class="text-muted-foreground">
        {posts.length}
        {posts.length === 1 ? 'post' : 'posts'} published
      </p>
    </div>

    {#if loading}
      <div class="py-12 text-center">
        <p class="text-muted-foreground">Loading your posts...</p>
      </div>
    {:else if posts.length === 0}
      <div class="space-y-4 py-12 text-center">
        <div class="mx-auto max-w-md">
          <h3 class="mb-2 text-lg font-medium text-foreground">No posts yet</h3>
          <p class="mb-6 text-muted-foreground">
            Start sharing your thoughts and ideas with the world.
          </p>
          <Button href="/create">Create Your First Post</Button>
        </div>
      </div>
    {:else}
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each posts as post (post.id)}
          <div class="relative">
            <PostCard {post} />
            <div class="absolute top-4 right-4">
              <Button href="/edit/{post.id}" size="sm" variant="outline">Edit</Button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
