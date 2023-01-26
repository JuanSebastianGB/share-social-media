import { matchedData } from "express-validator";
import Comment from "../models/comment.js";
import Post from "../models/post.js";
import { getPostService } from "../services/posts.js";
import { handleHttpErrors } from "../utilities/handleHttpErrors.js";

export const getItems = async (req, res) => {
	try {
		const items = await Comment.find({});
		return res.json(items);
	} catch (error) {
		handleHttpErrors(res, "ERROR_CREATE_COMMENT");
	}
};
export const getItem = async (req, res) => {
	try {
		const { id } = req.params;
		const item = await Comment.findById(id);
		return res.json(item);
	} catch (error) {
		handleHttpErrors(res, "ERROR_GET_COMMENT");
	}
};
export const createItem = async (req, res) => {
	try {
		const { postId, ...body } = matchedData(req);
		const post = await Post.findById(postId);
		const newItem = await Comment.create(body);
		if (!post.comments.includes(newItem._id)) {
			post.comments.push(newItem._id);
			await post.save();
		}
		const data = await getPostService(postId);
		return res.json(data[0]);
	} catch (error) {
		handleHttpErrors(res, "ERROR_CREATE_COMMENT");
	}
};
export const updateItem = async (req, res) => {
	try {
		const {
			body,
			params: { id },
		} = req;
		const response = await Comment.updateOne({ _id: id }, body);
		return res.json(response);
	} catch (error) {
		handleHttpErrors(res, "ERROR_UPDATE_COMMENT");
	}
};
export const deleteItem = async (req, res) => {
	try {
		const { id } = req.params;
		const response = await Comment.deleteOne({ _id: id });
		return res.json(response);
	} catch (error) {
		handleHttpErrors(res, "ERROR_DELETE_COMMENT");
	}
};
