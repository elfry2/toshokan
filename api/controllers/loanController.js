const Loan = require('../models/Loan');
const Book = require('../models/Book');

// Fetch all loans (with populated book and user details)
exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('book', 'title author')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch loans', error: error.message });
  }
};

// Issue a new loan
exports.createLoan = async (req, res) => {
  const { bookId, userId, copyCode } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is out of stock' });
    }

    const loan = new Loan({
      book: bookId,
      user: userId,
      copyCode
    });

    book.availableCopies -= 1;

    await loan.save();
    await book.save();

    res.status(201).json({ message: 'Book lent successfully', loan });
  } catch (error) {
    res.status(500).json({ message: 'Failed to issue loan', error: error.message });
  }
};

// Alias borrowBook to createLoan to prevent route errors
exports.borrowBook = exports.createLoan;

// Return a borrowed book
exports.returnBook = async (req, res) => {
  try {
    // Support both :id and :loanId parameter names from routes
    const loanId = req.params.id || req.params.loanId;
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan record not found' });
    }

    if (loan.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    loan.status = 'returned';
    loan.returnedAt = new Date();
    await loan.save();

    const book = await Book.findById(loan.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.status(200).json({ message: 'Book returned successfully', loan });
  } catch (error) {
    res.status(500).json({ message: 'Failed to return book', error: error.message });
  }
};