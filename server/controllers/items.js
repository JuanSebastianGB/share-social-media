import { matchedData } from 'express-validator';
import Item from '../models/item.js';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

export const getItems = async (req, res) => {
  try {
    const items = await Item.find({});
    return res.json(items);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_CREATE_ITEM');
  }
};
export const getItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    return res.json(item);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_GET_ITEM');
  }
};
export const createItem = async (req, res) => {
  try {
    const body = matchedData(req);
    const newItem = await Item.create(body);
    return res.json({ newItem });
  } catch (error) {
    handleHttpErrors(res, 'ERROR_CREATE_ITEM');
  }
};
export const updateItem = async (req, res) => {
  try {
    const {
      body,
      params: { id },
    } = req;
    const response = await Item.updateOne({ _id: id }, body);
    return res.json(response);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_UPDATE_ITEM');
  }
};
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await Item.deleteOne({ _id: id });
    return res.json(response);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_DELETE_ITEM');
  }
};
