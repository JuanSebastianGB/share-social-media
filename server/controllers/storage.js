import { matchedData } from 'express-validator';
import Storage from '../models/storage.js';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

const getItems = async (req, res) => {
  try {
    const items = await Storage.find({});
    return res.json(items);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_GET_FILES');
  }
};

const getItem = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const item = await Storage.findById(id);
    return res.json(item);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_GET_FILE');
  }
};

const createItem = async (req, res) => {
  try {
    const {
      file: { filename },
    } = req;
    const fileInfo = {
      filename,
      url: `${process.env.PUBLIC_URL}/${filename}`,
    };
    const response = await Storage.create(fileInfo);
    return res.json(response);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_UPLOAD_FILE');
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const response = await Storage.delete({ _id: id });
    return res.json(response);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_DELETE_FILE');
  }
};

export { getItems, createItem, getItem, deleteItem };
