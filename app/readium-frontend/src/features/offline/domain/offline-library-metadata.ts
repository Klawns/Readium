export interface LocalCategoryRecord {
  id: number;
  name: string;
  slug: string;
  color: string;
  parentId: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocalBookCategoryRecord {
  bookId: number;
  categoryId: number;
  updatedAt: string;
}

export interface LocalReadingCollectionRecord {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string;
  sortOrder: number;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalBookCollectionRecord {
  bookId: number;
  collectionId: number;
  updatedAt: string;
}

