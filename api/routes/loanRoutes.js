const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { isLibrarian } = require('../middleware/auth');

// GET all loans
router.get('/', isLibrarian, loanController.getLoans);

// POST issue new loan
router.post('/', isLibrarian, loanController.createLoan);

// Return book endpoints (supporting both PUT /:id/return and PATCH /:loanId/return)
router.patch('/:loanId/return', isLibrarian, loanController.returnBook);
router.put('/:id/return', isLibrarian, loanController.returnBook);

module.exports = router;