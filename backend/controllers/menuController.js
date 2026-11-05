const MenuItem = require('../models/MenuItem');

exports.getMenu = async (req, res) => {
  try {
    const items = await MenuItem.getAll(req.query.category);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (!name || !category || price === undefined || Number.isNaN(Number(price))) {
      return res.status(400).json({ message: 'name, category and price are required' });
    }
    const item = await MenuItem.create({ ...req.body, price: Number(price) });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.price !== undefined) body.price = Number(body.price);
    const item = await MenuItem.update(req.params.id, body);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const removed = await MenuItem.remove(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};