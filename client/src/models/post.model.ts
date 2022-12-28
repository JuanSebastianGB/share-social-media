export interface Post {
  _id: string;
  body: string;
  userId: string;
  fileId: string;
  likes: Map<string, boolean>;
  comments: string[];
}
