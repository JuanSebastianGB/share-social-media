import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.json({ response: 'get Items!' }));
router.get('/:id', (req, res) => res.json({ response: 'get item' }));
router.post('/', (req, res) => res.json({ response: 'create item!' }));
router.put('/:id', (req, res) => res.json({ response: 'update item!' }));
router.delete('/:id', (req, res) => res.json({ response: 'delete item' }));

export { router as itemRouter };
