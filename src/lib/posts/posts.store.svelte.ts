import { SuiGraphQLClient } from '@mysten/sui/graphql';
import { graphql } from '@mysten/sui/graphql/schemas/latest';
import { testnetWalletAdapter } from '@builders-of-stuff/svelte-sui-wallet-adapter';

import type { BlogPost, CreatePostData, UpdatePostData } from '$lib/types.js';
import {
  createPost,
  updatePost,
  deletePost
} from '$lib/shared/contract.tools.svelte.js';
import { PACKAGE_ID } from '$lib/shared/contract.constants';

// https://docs.sui.io/guides/developer/getting-started/graphql-rpc
// https://docs.sui.io/guides/developer/getting-started/graphql-rpc
// All posts state
//
const gqlClient = new SuiGraphQLClient({
  // works
  url: 'https://sui-testnet.mystenlabs.com/graphql'

  // does not work
  // url: 'https://graphql.testnet.sui.io/graphql'
});

export class PostsStore {
  // All posts state
  allPosts = $state<BlogPost[]>([]);

  // Loading states
  isLoadingAllPosts = $state(false);
  isLoadingAuthorPosts = $state(false);

  // Error state
  error = $state<string | null>(null);

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

  // Success state
  lastOperationSuccess = $state(false);

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
      const query = graphql(`
        query GetPosts($first: Int, $filter: ObjectFilter!) {
          objects(first: $first, filter: $filter) {
            edges {
              node {
                address
                asMoveObject {
                  contents {
                    json
                  }
                }
              }
            }
          }
        }
      `);

      // const query = graphql(`
      //   query {
      //     epoch {
      //       referenceGasPrice
      //     }
      //   }
      // `);

      const result = await gqlClient.query({
        query,
        variables: {
          first: 10,
          filter: {
            type: `${PACKAGE_ID}::posts::Post`
          }
        }
      });

      console.log('GQL Result:', result);

      // Mock posts data (until blockchain reading is implemented)
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Welcome to Our Blog',
          body: 'This is the first post on our decentralized blog platform. We use Sui blockchain for data management and Walrus for storage. This post showcases the basic functionality of our blogging platform.',
          author: '0x1234567890abcdef',
          publishedAt: new Date('2024-01-15T10:30:00Z')
        },
        {
          id: '2',
          title: 'Building with Sui and Walrus',
          body: 'In this post, we explore the benefits of building decentralized applications using Sui blockchain and Walrus storage. The combination provides scalability, security, and decentralization.',
          author: '0x1234567890abcdef',
          publishedAt: new Date('2024-01-20T14:15:00Z')
        },
        {
          id: '3',
          title: 'The Future of Content Publishing',
          body: 'Decentralized content publishing represents a paradigm shift in how we think about content ownership and distribution. With blockchain technology, creators maintain true ownership of their work.',
          author: '0xabcdef1234567890',
          publishedAt: new Date('2024-01-25T09:45:00Z')
        }
      ];

      await new Promise((resolve) => setTimeout(resolve, 100));
      this.allPosts = [...mockPosts].sort(
        (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
      );
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
      await new Promise((resolve) => setTimeout(resolve, 100));
      const posts = this.allPosts
        .filter((post) => post.author === author)
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
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
    return this.allPosts.find((post) => post.id === id);
  }

  addPost(post: BlogPost) {
    this.allPosts = [post, ...this.allPosts];

    // Update author posts cache if it exists
    const authorPosts = this.authorPosts.get(post.author);
    if (authorPosts) {
      this.authorPosts.set(post.author, [post, ...authorPosts]);
    }
  }

  updatePostInStore(updatedPost: BlogPost) {
    const index = this.allPosts.findIndex((post) => post.id === updatedPost.id);
    if (index !== -1) {
      this.allPosts[index] = updatedPost;
    }

    // Update author posts cache if it exists
    const authorPosts = this.authorPosts.get(updatedPost.author);
    if (authorPosts) {
      const authorIndex = authorPosts.findIndex((post) => post.id === updatedPost.id);
      if (authorIndex !== -1) {
        authorPosts[authorIndex] = updatedPost;
      }
    }
  }

  removePost(id: string) {
    const postIndex = this.allPosts.findIndex((post) => post.id === id);
    if (postIndex !== -1) {
      const removedPost = this.allPosts[postIndex];
      this.allPosts = this.allPosts.filter((post) => post.id !== id);

      // Update author posts cache if it exists
      const authorPosts = this.authorPosts.get(removedPost.author);
      if (authorPosts) {
        this.authorPosts.set(
          removedPost.author,
          authorPosts.filter((post) => post.id !== id)
        );
      }
    }
  }

  clearError() {
    this.error = null;
  }

  // Form validation and management methods
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
      await new Promise((resolve) => setTimeout(resolve, 100));
      const post = this.getPost(id) || null;
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

      if (!testnetWalletAdapter?.currentAccount?.address) {
        throw new Error(
          'Wallet not connected. Please connect your wallet to create a post.'
        );
      }

      try {
        // Create post on blockchain
        const txResult = await createPost(createData.title, createData.body);

        if (!txResult) {
          throw new Error('Failed to create post on blockchain');
        }

        // Create the BlogPost object to return
        const newPost: BlogPost = {
          id: txResult.digest || Math.random().toString(36).substring(2, 9),
          title: createData.title,
          body: createData.body,
          author: createData.author,
          publishedAt: new Date()
        };

        // Update global store
        this.addPost(newPost);

        this.lastOperationSuccess = true;
        this.resetForm();

        return newPost;
      } catch (blockchainError) {
        console.error('Blockchain createPost failed:', blockchainError);
        throw new Error('Failed to create post on blockchain. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to create post. Please try again.';
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

      if (!testnetWalletAdapter?.currentAccount?.address) {
        throw new Error(
          'Wallet not connected. Please connect your wallet to update a post.'
        );
      }

      const existingPost = this.getPost(this.currentPost.id);
      if (!existingPost) {
        throw new Error('Post not found');
      }

      if (existingPost.author !== testnetWalletAdapter.currentAccount.address) {
        throw new Error('You can only update your own posts');
      }

      try {
        const title = updateData.title ?? existingPost.title;
        const body = updateData.body ?? existingPost.body;

        const txResult = await updatePost(this.currentPost.id, title, body);

        if (!txResult) {
          throw new Error('Failed to update post on blockchain');
        }

        const updatedPost = {
          ...existingPost,
          ...updateData,
          updatedAt: new Date()
        };

        // Update global store
        this.updatePostInStore(updatedPost);

        this.setCurrentPost(updatedPost);
        this.lastOperationSuccess = true;

        return updatedPost;
      } catch (blockchainError) {
        console.error('Blockchain updatePost failed:', blockchainError);
        throw new Error('Failed to update post on blockchain. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to update post. Please try again.';
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
      if (!testnetWalletAdapter?.currentAccount?.address) {
        throw new Error(
          'Wallet not connected. Please connect your wallet to delete a post.'
        );
      }

      const existingPost = this.getPost(postId);
      if (!existingPost) {
        throw new Error('Post not found');
      }

      if (existingPost.author !== testnetWalletAdapter.currentAccount.address) {
        throw new Error('You can only delete your own posts');
      }

      try {
        const txResult = await deletePost(postId);

        if (!txResult) {
          throw new Error('Failed to delete post on blockchain');
        }

        const success = true;

        // Update global store
        this.removePost(postId);

        this.lastOperationSuccess = true;
        this.resetForm();

        return success;
      } catch (blockchainError) {
        console.error('Blockchain deletePost failed:', blockchainError);
        throw new Error('Failed to delete post on blockchain. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to delete post. Please try again.';
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

  clearSuccess() {
    this.lastOperationSuccess = false;
  }
}

// Export singleton instance
export const postsStore = new PostsStore();
