import type { BlogPost, CreatePostData, UpdatePostData } from '$lib/types.js';
import { createPost } from '$lib/shared/contract.tools.svelte.js';
import { testnetWalletAdapter } from '@builders-of-stuff/svelte-sui-wallet-adapter';

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

export class BlogService {
  static async getAllPosts(): Promise<BlogPost[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...mockPosts].sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );
  }

  static async getPost(id: string): Promise<BlogPost | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockPosts.find((post) => post.id === id) || null;
  }

  static async getPostsByAuthor(author: string): Promise<BlogPost[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockPosts
      .filter((post) => post.author === author)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  static async createPost(data: CreatePostData): Promise<BlogPost> {
    if (!testnetWalletAdapter?.currentAccount?.address) {
      throw new Error(
        'Wallet not connected. Please connect your wallet to create a post.'
      );
    }

    try {
      // Create post on blockchain
      const txResult = await createPost(data.title, data.body);

      if (!txResult) {
        throw new Error('Failed to create post on blockchain');
      }

      // Create the BlogPost object to return
      const newPost: BlogPost = {
        id: txResult.digest || Math.random().toString(36).substring(2, 9),
        title: data.title,
        body: data.body,
        author: data.author,
        publishedAt: new Date()
      };

      // Also add to mock posts for now (until we have blockchain reading)
      mockPosts.push(newPost);
      return newPost;
    } catch (error) {
      console.error('Blockchain createPost failed:', error);
      throw new Error('Failed to create post on blockchain. Please try again.');
    }
  }

  static async updatePost(id: string, data: UpdatePostData): Promise<BlogPost | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const postIndex = mockPosts.findIndex((post) => post.id === id);
    if (postIndex === -1) return null;

    const updatedPost = {
      ...mockPosts[postIndex],
      ...data,
      updatedAt: new Date()
    };

    mockPosts[postIndex] = updatedPost;
    return updatedPost;
  }

  static async deletePost(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const postIndex = mockPosts.findIndex((post) => post.id === id);
    if (postIndex === -1) return false;

    mockPosts.splice(postIndex, 1);
    return true;
  }
}
