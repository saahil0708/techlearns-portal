import { BlogPost } from '@/types/blog';

export const CURATED_BLOG_COVERS = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1516116211227-bbc03a089025?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
];

export interface NewBlogFormState {
  title: string;
  subtitle: string;
  category: string;
  coverImage: string;
  tags: string;
  authorName: string;
  authorCollege: string;
  content: string;
}

export interface EditBlogFormState {
  title: string;
  subtitle: string;
  category: string;
  status: 'Published' | 'Draft' | 'Archived';
  coverImage: string;
  tags: string;
  authorName: string;
  authorCollege: string;
  content: string;
}
