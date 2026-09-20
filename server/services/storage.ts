/**
 * Legacy storage service facade — delegates to the Media bounded context.
 * Prefer importing from `modules/media` for new code.
 */
export {
  createFileUploadedRegisterService,
  getFilesService,
  getFileService,
  deleteSoftFileService,
  deleteHardFileService,
  createDefaultService,
} from '../modules/media/index.js';
