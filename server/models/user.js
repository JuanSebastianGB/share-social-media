import mongoose from 'mongoose';
import { names } from './modelsNames.js';

const name = { type: String };
const username = { type: String };
const password = { type: String };
const email = { type: String };
const age = { type: Number };
const role = { type: ['user', 'admin'], default: 'user' };

const params = {
  name,
  username,
  password,
  email,
  age,
  role,
};

const UserSchema = new mongoose.Schema(params, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model(names.USERS, UserSchema);
