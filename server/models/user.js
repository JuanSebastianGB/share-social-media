import mongoose from 'mongoose';
import { names } from './modelsNames.js';

const firstName = { type: String, min: 5, max: 30 };
const lastName = { type: String, min: 5, max: 30 };
const username = { type: String };
const password = { type: String, required: true, min: 5 };
const email = { type: String, required: true, unique: true, max: 50 };
const age = Number;
const role = { type: ['user', 'admin'], default: 'user' };
const friends = { type: Array, default: [] };
const location = String;
const occupation = String;
const viewedProfile = Number;
const impressions = Number;
const profileImageId = { type: mongoose.Types.ObjectId };

const params = {
  firstName,
  lastName,
  username,
  password,
  email,
  age,
  role,
  friends,
  location,
  occupation,
  viewedProfile,
  impressions,
  profileImageId,
};

const UserSchema = new mongoose.Schema(params, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model(names.USERS, UserSchema);
