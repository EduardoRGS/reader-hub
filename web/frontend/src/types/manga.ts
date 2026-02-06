export interface Manga {
  id: string;
  apiId?: string;
  title: {
    "pt-br"?: string;
    en?: string;
    [key: string]: string | undefined;
  };
  description?: {
    "pt-br"?: string;
    en?: string;
    [key: string]: string | undefined;
  };
  status: MangaStatus;
  year?: string;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  follows?: number;
  rating?: number;
  ratingCount?: number;
  totalChapters?: number;
  author?: Author;
  coverImage?: string;
}

export interface Author {
  id: string;
  apiId?: string;
  name: string;
  biography?: {
    en?: string;
    "pt-br"?: string;
  };
  totalMangas?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  id: string;
  number: number;
  title?: string;
  volume?: string;
  pages?: number;
  language?: string;
  releaseDate?: string;
  isRead?: boolean;
  mangaId: string;
  imageUrls?: string[];
  views?: number;
  comments?: number;
}

export interface BackendChapterResponseDto {
  id: string;
  apiId?: string;
  title?: string;
  volume?: string;
  chapter?: string | number;
  pages?: number;
  status?: string;
  language?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  readableAt?: string;
  views?: number;
  comments?: number;
  imageUrls?: string[];
  mangaId?: string;
  manga?: { id: string };
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PopulationStats {
  totalMangas: number;
  totalAuthors: number;
  totalChapters: number;
}

export interface PopulationResult {
  status: string;
  message: string;
  totalFound?: number;
  mangasSaved?: number;
  authorsSaved?: number;
  chaptersSaved?: number;
  limit?: number;
  offset?: number;
}

export type MangaStatus = "ongoing" | "completed" | "hiatus" | "cancelled";
