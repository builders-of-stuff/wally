export interface BlogPost {
  id: string;
  title: string;
  body: string;
  author: string;
  publishedAt: Date;
  updatedAt?: Date;
}

export interface CreatePostData {
  title: string;
  body: string;
  author: string;
}

export interface UpdatePostData {
  title?: string;
  body?: string;
}
