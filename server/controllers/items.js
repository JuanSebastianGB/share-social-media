import Item from '../models/item.js';

export const getItems = async (req, res) => {
  const items = await Item.find({});
  return res.json(items);
};
export const getItem = async (req, res) => {
  const { id } = req.params;
  const item = await Item.findById(id);
  return res.json(item);
};
export const createItem = async (req, res) => {
  const { body } = req;
  const newItem = await Item.create(body);
  return res.json({ newItem });
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
  const { id } = req.params;
  const response = await Item.deleteOne({ _id: id });
  return res.json(response);
};
