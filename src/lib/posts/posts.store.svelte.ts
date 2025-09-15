import type { BlogPost } from '$lib/types.js';
import { PostsService } from './posts.service.svelte.js';

export class PostsStore {
  // All posts state
  allPosts = $state<BlogPost[]>([]);

  // Loading states
  isLoadingAllPosts = $state(false);
  isLoadingAuthorPosts = $state(false);

  // Error state
  error = $state<string | null>(null);

  // Author posts cache
  authorPosts = $state<Map<string, BlogPost[]>>(new Map());

  // Initialization state
  private isInitialized = $state(false);

  get initialized() {
    return this.isInitialized;
  }

  async initialize() {
    if (this.isInitialized) return;

    await this.loadAllPosts();
    this.isInitialized = true;
  }

  async loadAllPosts() {
    this.isLoadingAllPosts = true;
    this.error = null;

    try {
      this.allPosts = await PostsService.getAllPosts();
    } catch (error) {
      console.error('Failed to load posts:', error);
      this.error = 'Failed to load posts. Please try again.';
    } finally {
      this.isLoadingAllPosts = false;
    }
  }

  async loadPostsByAuthor(author: string) {
    this.isLoadingAuthorPosts = true;
    this.error = null;

    try {
      const posts = await PostsService.getPostsByAuthor(author);
      this.authorPosts.set(author, posts);
      return posts;
    } catch (error) {
      console.error('Failed to load author posts:', error);
      this.error = 'Failed to load author posts. Please try again.';
      return [];
    } finally {
      this.isLoadingAuthorPosts = false;
    }
  }

  async refreshPosts() {
    await this.loadAllPosts();
    // Clear author posts cache to force refresh
    this.authorPosts.clear();
  }

  getPostsByAuthor(author: string): BlogPost[] {
    return this.authorPosts.get(author) || [];
  }

  getPost(id: string): BlogPost | undefined {
    return this.allPosts.find(post => post.id === id);
  }

  addPost(post: BlogPost) {
    this.allPosts = [post, ...this.allPosts];

    // Update author posts cache if it exists
    const authorPosts = this.authorPosts.get(post.author);
    if (authorPosts) {
      this.authorPosts.set(post.author, [post, ...authorPosts]);
    }
  }

  updatePost(updatedPost: BlogPost) {
    const index = this.allPosts.findIndex(post => post.id === updatedPost.id);
    if (index !== -1) {
      this.allPosts[index] = updatedPost;
    }

    // Update author posts cache if it exists
    const authorPosts = this.authorPosts.get(updatedPost.author);
    if (authorPosts) {
      const authorIndex = authorPosts.findIndex(post => post.id === updatedPost.id);
      if (authorIndex !== -1) {
        authorPosts[authorIndex] = updatedPost;
      }
    }
  }

  removePost(id: string) {
    const postIndex = this.allPosts.findIndex(post => post.id === id);
    if (postIndex !== -1) {
      const removedPost = this.allPosts[postIndex];
      this.allPosts = this.allPosts.filter(post => post.id !== id);

      // Update author posts cache if it exists
      const authorPosts = this.authorPosts.get(removedPost.author);
      if (authorPosts) {
        this.authorPosts.set(
          removedPost.author,
          authorPosts.filter(post => post.id !== id)
        );
      }
    }
  }

  clearError() {
    this.error = null;
  }
}

// Export singleton instance
export const postsStore = new PostsStore();