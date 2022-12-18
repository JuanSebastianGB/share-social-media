import mongoose from 'mongoose';
import { names } from './modelsNames.js';

const name = {
  type: String,
};

const params = {
  name,
};

const UserSchema = new mongoose.Schema(params, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model(names.ITEM, UserSchema);
