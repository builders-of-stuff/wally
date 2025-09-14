import type { BlogPost, CreatePostData, UpdatePostData } from '$lib/types.js';

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
    await new Promise((resolve) => setTimeout(resolve, 200));

    const newPost: BlogPost = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      body: data.body,
      author: data.author,
      publishedAt: new Date()
    };

    mockPosts.push(newPost);
    return newPost;
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
