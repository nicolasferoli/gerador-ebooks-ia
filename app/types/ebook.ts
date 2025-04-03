export type EbookTemplate = {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  chapterStructure: string[];
};

export type EbookStatus = 
  | 'draft'
  | 'generating_toc'
  | 'generating_chapters'
  | 'generating_cover'
  | 'completed'
  | 'failed';

export type Chapter = {
  id: string;
  ebookId: string;
  number: number;
  title: string;
  content: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
};

export type Ebook = {
  id: string;
  userId: string;
  title: string;
  description: string;
  templateId: string | null;
  coverImageUrl: string | null;
  status: EbookStatus;
  progress: number;
  tocGenerated: boolean;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
};

export type EbookCreationData = {
  title: string;
  description: string;
  templateId?: string;
  chapterTitles?: string[];
};

export type GenerationProgress = {
  ebookId: string;
  status: EbookStatus;
  progress: number;
  message: string;
  updatedAt: string;
}; 