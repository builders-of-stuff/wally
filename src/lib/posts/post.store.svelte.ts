import type { BlogPost, CreatePostData, UpdatePostData } from '$lib/types.js';
import { PostsService } from './posts.service.svelte.js';
import { postsStore } from './posts.store.svelte.js';

export class PostStore {
  // Current post being created/edited
  currentPost = $state<BlogPost | null>(null);

  // Form data for create/edit
  formData = $state<{
    title: string;
    body: string;
    author: string;
  }>({
    title: '',
    body: '',
    author: ''
  });

  // Form validation state
  validation = $state<{
    title: string | null;
    body: string | null;
    author: string | null;
  }>({
    title: null,
    body: null,
    author: null
  });

  // Operation states
  isCreating = $state(false);
  isUpdating = $state(false);
  isDeleting = $state(false);
  isLoading = $state(false);

  // Error state
  error = $state<string | null>(null);

  // Success state
  lastOperationSuccess = $state(false);

  get isValidForm(): boolean {
    return (
      this.formData.title.trim().length > 0 &&
      this.formData.body.trim().length > 0 &&
      this.formData.author.trim().length > 0 &&
      !this.validation.title &&
      !this.validation.body &&
      !this.validation.author
    );
  }

  get isBusy(): boolean {
    return this.isCreating || this.isUpdating || this.isDeleting || this.isLoading;
  }

  async loadPost(id: string): Promise<BlogPost | null> {
    this.isLoading = true;
    this.error = null;

    try {
      const post = await PostsService.getPost(id);
      this.setCurrentPost(post);
      return post;
    } catch (error) {
      console.error('Failed to load post:', error);
      this.error = 'Failed to load post. Please try again.';
      return null;
    } finally {
      this.isLoading = false;
    }
  }

  setCurrentPost(post: BlogPost | null) {
    this.currentPost = post;
    if (post) {
      this.formData = {
        title: post.title,
        body: post.body,
        author: post.author
      };
    } else {
      this.resetForm();
    }
    this.clearValidation();
  }

  resetForm() {
    this.formData = {
      title: '',
      body: '',
      author: ''
    };
    this.clearValidation();
    this.currentPost = null;
    this.error = null;
    this.lastOperationSuccess = false;
  }

  updateFormField(field: keyof typeof this.formData, value: string) {
    this.formData[field] = value;
    this.validateField(field);
  }

  validateField(field: keyof typeof this.formData) {
    const value = this.formData[field].trim();

    switch (field) {
      case 'title':
        this.validation.title = value.length === 0 ? 'Title is required' : null;
        break;
      case 'body':
        this.validation.body = value.length === 0 ? 'Body is required' : null;
        break;
      case 'author':
        this.validation.author = value.length === 0 ? 'Author is required' : null;
        break;
    }
  }

  validateForm(): boolean {
    this.validateField('title');
    this.validateField('body');
    this.validateField('author');
    return this.isValidForm;
  }

  async createPost(): Promise<BlogPost | null> {
    if (!this.validateForm()) {
      this.error = 'Please fix validation errors before submitting.';
      return null;
    }

    this.isCreating = true;
    this.error = null;
    this.lastOperationSuccess = false;

    try {
      const createData: CreatePostData = {
        title: this.formData.title.trim(),
        body: this.formData.body.trim(),
        author: this.formData.author.trim()
      };

      const newPost = await PostsService.createPost(createData);

      // Update global store
      postsStore.addPost(newPost);

      this.lastOperationSuccess = true;
      this.resetForm();

      return newPost;
    } catch (error) {
      console.error('Failed to create post:', error);
      this.error = error instanceof Error ? error.message : 'Failed to create post. Please try again.';
      return null;
    } finally {
      this.isCreating = false;
    }
  }

  async updatePost(): Promise<BlogPost | null> {
    if (!this.currentPost || !this.validateForm()) {
      this.error = 'Please fix validation errors before submitting.';
      return null;
    }

    this.isUpdating = true;
    this.error = null;
    this.lastOperationSuccess = false;

    try {
      const updateData: UpdatePostData = {
        title: this.formData.title.trim(),
        body: this.formData.body.trim()
      };

      const updatedPost = await PostsService.updatePost(this.currentPost.id, updateData);

      if (updatedPost) {
        // Update global store
        postsStore.updatePost(updatedPost);

        this.setCurrentPost(updatedPost);
        this.lastOperationSuccess = true;
      }

      return updatedPost;
    } catch (error) {
      console.error('Failed to update post:', error);
      this.error = error instanceof Error ? error.message : 'Failed to update post. Please try again.';
      return null;
    } finally {
      this.isUpdating = false;
    }
  }

  async deletePost(id?: string): Promise<boolean> {
    const postId = id || this.currentPost?.id;
    if (!postId) {
      this.error = 'No post to delete.';
      return false;
    }

    this.isDeleting = true;
    this.error = null;
    this.lastOperationSuccess = false;

    try {
      const success = await PostsService.deletePost(postId);

      if (success) {
        // Update global store
        postsStore.removePost(postId);

        this.lastOperationSuccess = true;
        this.resetForm();
      }

      return success;
    } catch (error) {
      console.error('Failed to delete post:', error);
      this.error = error instanceof Error ? error.message : 'Failed to delete post. Please try again.';
      return false;
    } finally {
      this.isDeleting = false;
    }
  }

  clearValidation() {
    this.validation = {
      title: null,
      body: null,
      author: null
    };
  }

  clearError() {
    this.error = null;
  }

  clearSuccess() {
    this.lastOperationSuccess = false;
  }
}

// Export singleton instance
export const postStore = new PostStore();