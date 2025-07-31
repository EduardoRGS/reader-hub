export interface Manga {
  id: string;
  apiId?: string;
  title: {
    'pt-br': string;
    'en': string;
  };
  description?: {
    'pt-br': string;
    'en': string;
  };
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  year?: string;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  follows?: number;
  rating?: number;
  ratingCount?: number;
  totalChapters?: number;
  author?: {
    id: string;
    name: string;
    totalMangas?: number;
  };
  coverImage?: string;
  // Campos para compatibilidade com o frontend atual
  image?: string;
  chapter?: string;
  genres?: string[];
}

export interface Chapter {
  id: string;
  number: number;
  title?: string;
  pages?: number;
  releaseDate?: string;
  isRead?: boolean;
  mangaId: string;
  imageUrls?: string[]; // URLs das imagens do capítulo
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

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
} 