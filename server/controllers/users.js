import { matchedData } from 'express-validator';
import User from '../models/user.js';
import { handleHttpErrors } from '../utilities/handleHttpErrors.js';

const getItems = async (req, res) => {
  try {
    const items = await User.find({}).select('name email role');
    return res.json(items);
  } catch (error) {
    console.log(error);
    handleHttpErrors(res, 'ERROR_GET_USERS');
  }
};

const getItem = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const item = await User.findById(id).select('name email role');
    return res.json(item);
  } catch (error) {
    handleHttpErrors(res, 'ERROR_GET_USER');
  }
};

export { getItems, getItem };