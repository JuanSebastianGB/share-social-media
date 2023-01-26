import mongoose from "mongoose";
import { names } from "./modelsNames.js";

const CommentSchema = new mongoose.Schema(
	{
		description: { type: String, required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
	},
	{ timestamps: true, versionKey: false },
);

export default mongoose.model(names.COMMENTS, CommentSchema);
