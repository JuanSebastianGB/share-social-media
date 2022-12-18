import mongoose from 'mongoose';
import { names } from './modelsNames.js';

const name = {
  type: String,
  required: true,
  unique: true,
};
const active = {
  type: Boolean,
  default: true,
};

const params = {
  name,
  active,
};

const UserSchema = new mongoose.Schema(params, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model(names.ITEM, UserSchema);
