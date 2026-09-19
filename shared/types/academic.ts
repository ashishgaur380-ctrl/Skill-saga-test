export interface Board {
  id: string;
  name: string;
  code: string;
  active: boolean;
  sortOrder: number;
}

export interface ClassLevel {
  id: string;
  name: string;
  code: string;
  numericLevel?: number;
  active: boolean;
  sortOrder: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classIds: string[];
  boardIds: string[];
  active: boolean;
  sortOrder: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  sortOrder: number;
  active: boolean;
}

export interface Topic {
  id: string;
  chapterId: string;
  name: string;
  sortOrder: number;
  active: boolean;
}

export interface Skill {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  active: boolean;
  sortOrder: number;
}
