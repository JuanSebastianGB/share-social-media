export const getItems = (req, res) => res.json({ response: 'get Items!' });
export const getItem = (req, res) => res.json({ response: 'get item' });
export const createItem = (req, res) => res.json({ response: req.body });
export const updateItem = (req, res) => res.json({ response: 'update item!' });
export const deleteItem = (req, res) => res.json({ response: 'delete item' });
