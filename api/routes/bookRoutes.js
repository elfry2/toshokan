// api/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { isLibrarian } = require('../middleware/auth');

router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);

// Restricted Librarian Routes
router.post('/', isLibrarian, bookController.createBook);
router.put('/:id', isLibrarian, bookController.updateBook);
router.delete('/:id', isLibrarian, bookController.deleteBook);

module.exports = router;