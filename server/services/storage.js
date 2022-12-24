import Storage from '../models/storage.js';

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

export { createFileUploadedRegisterService, getFilesService, getFileService };
