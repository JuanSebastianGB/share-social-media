import mongoose from 'mongoose';
import { names } from './modelsNames.js';

const PostSchema = new mongoose.Schema(
  {
    body: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    likes: { type: Map, of: Boolean },
    comments: { type: Array, default: [] },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model(names.POSTS, PostSchema);
