import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Storage from "../models/storage.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEDIA_PATH = `${__dirname}/../storage`;

/**
 * It's an async function that returns the result of an async function that calls the find method on
 * the Storage class
 */
const getFilesService = async () => await Storage.find({});

/**
 * It returns a file object from the database
 * @param id - The id of the file you want to retrieve.
 */
const getFileService = async (id) => await Storage.findById(id);

/**
 * It creates a new file uploaded register in the database.
 * @param filename - The name of the file that was uploaded.
 * @returns The fileInfo object.
 */
const createFileUploadedRegisterService = async (filename) => {
	const fileInfo = {
		filename,
		url: `${process.env.PUBLIC_URL}/${filename}`,
	};
	return await Storage.create(fileInfo);
};

/**
 * It deletes a file from the database.
 * @param id - The id of the file to be deleted.
 */
const deleteSoftFileService = async (id) => await Storage.delete({ _id: id });

/**
 * It deletes a file from the database and the file system
 * @param id - the id of the file in the database
 * @returns The return value of the function is the result of the deleteOne() method.
 */
const deleteHardFileService = async (id) => {
	const data = await Storage.findById(id);
	const filename = data.url.split("/").pop();
	const filePath = `${MEDIA_PATH}/${filename}`;
	fs.unlinkSync(filePath);
	return await Storage.deleteOne({ _id: id });
};

const createDefaultService = async () => {
	const defaultId = "63cf4d2242c5e33c105a87eb";
	const file = await getFileService(defaultId);
	let response = null;
	console.log({ file });
	if (!file) response = await Storage.create({ _id: defaultId });
	return response;
};

export {
	createFileUploadedRegisterService,
	getFilesService,
	getFileService,
	deleteSoftFileService,
	deleteHardFileService,
	createDefaultService,
};
