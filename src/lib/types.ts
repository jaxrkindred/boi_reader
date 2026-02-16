export type ReadingStatus = 'not_started' | 'in_progress' | 'completed';

export interface Resource {
  type: 'podcast' | 'video' | 'article' | 'discussion';
  title: string;
  url: string;
  source: string;
  description: string;
}

export interface Chapter {
  id: number;
  title: string;
  slug: string;
  description: string;
  keyConcepts: string[];
  resources: Resource[];
}

export interface ReadingProgress {
  user_id: string;
  chapter_id: number;
  status: ReadingStatus;
  started_at: string | null;
  completed_at: string | null;
}

export interface ChatMessage {
  id?: string;
  user_id: string;
  chapter_id: number | null;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface UserNote {
  id?: string;
  user_id: string;
  chapter_id: number;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  user_id: string;
  display_name: string;
  created_at: string;
}
