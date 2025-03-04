export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  source: 'google' | 'youtube' | 'linkedin';
  relevanceScore: number;
  thumbnail?: string;
  publishedDate?: string;
  author?: string;
  additionalInfo?: Record<string, any>;
}

export interface FilterOptions {
  google: boolean;
  youtube: boolean;
  linkedin: boolean;
}