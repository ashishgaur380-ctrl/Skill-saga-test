export type AcademicCollection = 'boards' | 'classes' | 'subjects' | 'chapters' | 'topics' | 'skillCategories' | 'skills';

export interface AcademicWriteContext { uid: string; role: string; }
export interface AcademicMutation<T> { id?: string; data: T; context: AcademicWriteContext; }
export interface AcademicService { list(collection: AcademicCollection): Promise<unknown[]>; get(collection: AcademicCollection,id:string): Promise<unknown|null>; create<T>(collection: AcademicCollection, mutation: AcademicMutation<T>): Promise<string>; update<T>(collection: AcademicCollection,id:string,mutation:AcademicMutation<T>): Promise<void>; archive(collection:AcademicCollection,id:string,context:AcademicWriteContext): Promise<void>; }
