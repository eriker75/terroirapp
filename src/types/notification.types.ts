export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}
