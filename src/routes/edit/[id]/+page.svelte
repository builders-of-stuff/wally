<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { PostsService } from '$lib/posts/posts.service.svelte.js';
  import PostForm from '$lib/components/post-form.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import type { BlogPost } from '$lib/types.js';

  let post: BlogPost | null = $state(null);
  let loading = $state(true);
  let notFound = $state(false);
  let isSubmitting = $state(false);

  onMount(async () => {
    const postId = $page.params.id;
    if (!postId) {
      notFound = true;
      loading = false;
      return;
    }

    try {
      const fetchedPost = await PostsService.getPost(postId);
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

  async function handleSubmit(data: { title: string; body: string; author: string }) {
    if (!post) return;

    isSubmitting = true;

    try {
      const updatedPost = await PostsService.updatePost(post.id, {
        title: data.title,
        body: data.body
      });

      if (updatedPost) {
        goto(`/post/${post.id}`);
      } else {
        throw new Error('Failed to update post');
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancel() {
    if (post) {
      goto(`/post/${post.id}`);
    } else {
      goto('/');
    }
  }
</script>

<svelte:head>
  <title>{post ? `Edit: ${post.title}` : 'Edit Post'} - Wally Blog</title>
</svelte:head>

{#if loading}
  <div class="py-12 text-center">
    <p class="text-muted-foreground">Loading post...</p>
  </div>
{:else if notFound || !post}
  <div class="space-y-4 py-12 text-center">
    <h1 class="text-2xl font-bold text-foreground">Post Not Found</h1>
    <p class="text-muted-foreground">The post you're trying to edit doesn't exist.</p>
    <Button href="/" variant="outline">Back to Home</Button>
  </div>
{:else}
  <PostForm {post} onSubmit={handleSubmit} onCancel={handleCancel} {isSubmitting} />
{/if}
