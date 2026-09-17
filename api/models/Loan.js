const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  copyCode: { type: String, required: true }, // Physical code/barcode assigned at lending
  status: { type: String, enum: ['active', 'returned'], default: 'active' },
  returnedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);