import express from "express";
import {
	createFileUploadedRegister,
	deleteFile,
	getFile,
	getFiles,
} from "../controllers/storage.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { defaultErrorFor } from "../utilities/defaultErrorFor.js";
import uploadMiddleware from "../utilities/handleUploadFile.js";
import { validatorGetItem } from "../validators/storage.js";
const router = express.Router();

router.get("/", defaultErrorFor("ERROR_GET_FILES"), asyncHandler(getFiles));
router.get("/:id", defaultErrorFor("ERROR_GET_FILE"), validatorGetItem, asyncHandler(getFile));
router.post(
	"/",
	defaultErrorFor("ERROR_UPLOAD_FILE"),
	uploadMiddleware.single("myFile"),
	asyncHandler(createFileUploadedRegister),
);
router.delete("/:id", defaultErrorFor("ERROR_DELETE_FILE"), validatorGetItem, asyncHandler(deleteFile));

export default router;