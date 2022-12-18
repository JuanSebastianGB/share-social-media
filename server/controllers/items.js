import { matchedData } from 'express-validator';
import Item from '../models/item.js';

export const getItems = async (req, res) => {
  const items = await Item.find({});
  return res.json(items);
};
export const getItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    return res.json(item);
  } catch (error) {
    res.status(500);
    return res.json(error);
  }
};
export const createItem = async (req, res) => {
  try {
    const body = matchedData(req);
    console.log(body);
    const newItem = await Item.create(body);
    return res.json({ newItem });
  } catch (error) {
    return res.json(error);
  }
};
export const updateItem = async (req, res) => {
  const {
    body,
    params: { id },
  } = req;
  const response = await Item.updateOne({ _id: id }, body);
  return res.json(response);
};
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await Item.deleteOne({ _id: id });
    return res.json(response);
  } catch (error) {
    res.json(error);
  }
};
