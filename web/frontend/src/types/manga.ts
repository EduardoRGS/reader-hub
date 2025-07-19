export interface Manga {
  id: number;
  title: string;
  image: string;
  chapter: string;
  rating: number;
  genres?: string[];
}

export interface Category {
  name: string;
  count: number;
  color: string;
}

export interface MangaCardProps {
  manga: Manga;
  variant?: 'featured' | 'popular';
  index?: number;
}

export interface CategoryCardProps {
  category: Category;
} 