export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
}
