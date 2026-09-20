import { DEFAULT_IMAGE_ID } from '../constants/constants.js';
import {
  createStorage,
  getStorageById,
  getStorageByIdIncludingDeleted,
  hardDeleteStorage,
  listStorage,
  softDeleteStorage,
} from '../repositories/storage.js';
import { deleteMediaObject } from '../utilities/s3Upload.js';

const getFilesService = async () => await listStorage();

const getFileService = async (id: string) => await getStorageById(id);

const createFileUploadedRegisterService = async (
  filename: string,
  url?: string,
) => {
  return await createStorage({
    fileName: filename,
    url,
  });
};

const deleteSoftFileService = async (id: string) =>
  await softDeleteStorage(id);

const deleteHardFileService = async (id: string | unknown) => {
  const data = await getStorageByIdIncludingDeleted(String(id));
  if (data?.url) {
    try {
      await deleteMediaObject(data.url);
    } catch {
      // Best-effort S3 cleanup; still remove Dynamo metadata
    }
  }
  return await hardDeleteStorage(String(id));
};

const createDefaultService = async () => {
  const defaultId = DEFAULT_IMAGE_ID;
  const file = await getFileService(defaultId);
  let response = null;
  if (!file) response = await createStorage({ _id: defaultId });
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
