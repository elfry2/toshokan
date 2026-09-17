const Book = require('../models/Book');

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, totalCopies } = req.body;
    
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'A book with this ISBN already exists' });
    }

    const newBook = new Book({
      title,
      author,
      isbn,
      totalCopies: totalCopies || 1,
      availableCopies: totalCopies || 1
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// api/controllers/bookController.js (Additions)

exports.updateBook = async (req, res) => {
  try {
    const { title, author, isbn, totalCopies, availableCopies } = req.body;

    // Check if ISBN is being changed and already exists on another book
    if (isbn) {
      const existingBook = await Book.findOne({ isbn, _id: { $ne: req.params.id } });
      if (existingBook) {
        return res.status(400).json({ message: 'Another book with this ISBN already exists' });
      }
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, isbn, totalCopies, availableCopies },
      { new: true, runValidators: true }
    );

    if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};