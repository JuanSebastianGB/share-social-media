import { matchedData } from "express-validator";
import {
	createDefaultService,
	createFileUploadedRegisterService,
	deleteSoftFileService,
	getFileService,
	getFilesService,
} from "../services/storage.js";
import { handleHttpErrors } from "../utilities/handleHttpErrors.js";

const getFiles = async (req, res) => {
	try {
		const files = await getFilesService();
		return res.json(files);
	} catch (error) {
		handleHttpErrors(res, "ERROR_GET_FILES");
	}
};

const getFile = async (req, res) => {
	try {
		const { id } = matchedData(req);
		const file = await getFileService(id);
		return res.json(file);
	} catch (error) {
		handleHttpErrors(res, "ERROR_GET_FILE");
	}
};

const createFileUploadedRegister = async (req, res) => {
	try {
		const {
			file: { filename },
		} = req;
		const response = await createFileUploadedRegisterService(filename);
		return res.json(response);
	} catch (error) {
		console.log(
			"🚀 ~ file: storage.js:37 ~ createFileUploadedRegister ~ error",
			error,
		);
		handleHttpErrors(res, "ERROR_UPLOAD_FILE");
	}
};

const deleteFile = async (req, res) => {
	try {
		const { id } = matchedData(req);
		const response = await deleteSoftFileService(id);
		return res.json(response);
	} catch (error) {
		handleHttpErrors(res, "ERROR_DELETE_FILE");
	}
};

const createDefault = async (req, res) => {
	const creationDefault = await createDefaultService();
	res.json(creationDefault);
};

export {
	getFiles,
	createFileUploadedRegister,
	getFile,
	deleteFile,
	createDefault,
};
