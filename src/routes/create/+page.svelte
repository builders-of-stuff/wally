<script lang="ts">
  import { goto } from '$app/navigation';
  import { BlogService } from '$lib/services/blog.svelte.js';
  import PostForm from '$lib/components/post-form.svelte';

  let isSubmitting = $state(false);

  async function handleSubmit(data: { title: string; body: string; author: string }) {
    isSubmitting = true;

    try {
      const newPost = await BlogService.createPost(data);
      goto(`/post/${newPost.id}`);
    } catch (error) {
      console.error('Failed to create post:', error);
      // Re-throw with user-friendly message
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(errorMessage);
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancel() {
    goto('/');
  }
</script>

<svelte:head>
  <title>Create New Post - Wally Blog</title>
</svelte:head>

<PostForm onSubmit={handleSubmit} onCancel={handleCancel} {isSubmitting} />
