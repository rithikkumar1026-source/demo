const router = require('express').Router();
const { getMenu, createItem, updateItem, deleteItem } = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getMenu);                              // public: landing page
router.post('/', protect, adminOnly, createItem);      // admin only
router.put('/:id', protect, adminOnly, updateItem);    // admin only
router.delete('/:id', protect, adminOnly, deleteItem); // admin only

module.exports = router;