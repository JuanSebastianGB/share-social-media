import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';
import { names } from './modelsNames.js';

const url = String;
const fileName = String;
const params = {
  url,
  fileName,
};

const StorageSchema = mongoose.Schema(params, {
  timestamps: true,
  versionKey: false,
});

StorageSchema.plugin(mongooseDelete, { overrideMethods: 'all' });

export default mongoose.model(names.STORAGE, StorageSchema);
