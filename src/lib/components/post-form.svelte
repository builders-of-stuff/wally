<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import type { BlogPost } from '$lib/types.js';

  interface PostFormProps {
    post?: BlogPost;
    onSubmit: (data: { title: string; body: string; author: string }) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
  }

  let { post, onSubmit, onCancel, isSubmitting = false }: PostFormProps = $props();

  let title = $state(post?.title || '');
  let body = $state(post?.body || '');
  let author = $state(post?.author || '0x1234567890abcdef');

  const isEdit = !!post;

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!title.trim() || !body.trim() || !author.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await onSubmit({ title: title.trim(), body: body.trim(), author: author.trim() });
    } catch (error) {
      console.error('Failed to submit post:', error);
      alert('Failed to save post. Please try again.');
    }
  }
</script>

<div class="mx-auto max-w-4xl">
  <div class="mb-8">
    <h1 class="mb-2 text-3xl font-bold text-foreground">
      {isEdit ? 'Edit Post' : 'Create New Post'}
    </h1>
    <p class="text-muted-foreground">
      {isEdit ? 'Update your blog post' : 'Share your thoughts with the world'}
    </p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-6">
    <div>
      <label for="author" class="mb-2 block text-sm font-medium text-foreground">
        Author Address
      </label>
      <input
        id="author"
        type="text"
        bind:value={author}
        placeholder="0x..."
        disabled={isEdit}
        class="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        required
      />
      <p class="mt-1 text-xs text-muted-foreground">
        {isEdit
          ? 'Author cannot be changed'
          : 'Your wallet address (this will be connected automatically in production)'}
      </p>
    </div>

    <div>
      <label for="title" class="mb-2 block text-sm font-medium text-foreground">
        Post Title
      </label>
      <input
        id="title"
        type="text"
        bind:value={title}
        placeholder="Enter your post title..."
        class="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring focus:outline-none"
        required
      />
    </div>

    <div>
      <label for="body" class="mb-2 block text-sm font-medium text-foreground">
        Post Content
      </label>
      <textarea
        id="body"
        bind:value={body}
        placeholder="Write your blog post here..."
        rows="20"
        class="resize-vertical w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring focus:outline-none"
        required
      ></textarea>
      <p class="mt-1 text-xs text-muted-foreground">
        Supports plain text and line breaks
      </p>
    </div>

    <div class="flex gap-4 pt-4">
      <Button type="submit" disabled={isSubmitting}>
        {#if isSubmitting}
          {isEdit ? 'Updating...' : 'Publishing...'}
        {:else}
          {isEdit ? 'Update Post' : 'Publish Post'}
        {/if}
      </Button>

      <Button
        type="button"
        variant="outline"
        onclick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
    </div>
  </form>
</div>
