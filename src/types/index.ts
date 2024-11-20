export interface Feed {
  id: string;
  title: string;
  url: string;
  collectionId: string;
}

export interface Collection {
  id: string;
  name: string;
  color: string;
}

export interface Article {
  id: string;
  feedId: string;
  title: string;
  link: string;
  content: string;
  pubDate: Date;
  isRead: boolean;
  isFavorite: boolean;
  isUserCreated?: boolean;
  isAIArticle?: boolean;
}

export interface OllamaSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  prompt: string;
}

export interface LinkedInPostParams {
  tone: 'professional' | 'casual' | 'technical' | 'storytelling';
  audience: string;
  industry: string;
  keyMessage: string;
  includeHashtags: boolean;
  includeCallToAction: boolean;
}