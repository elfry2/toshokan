import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import EditBookModal from '../components/EditBookModal';
import CheckoutModal from '../components/CheckoutModal';

export default function Catalog() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [checkoutBook, setCheckoutBook] = useState(null);

  // New Book Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [totalCopies, setTotalCopies] = useState(1);
  const [formError, setFormError] = useState('');

  const queryClient = useQueryClient();

  // Reset to first page whenever search input changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Fetch current user to check role
  const { data: user } = useQuery({ queryKey: ['authUser'] });

  // Fetch books
  const { data: books, isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await api.get('/books');
      return res.data;
    },
  });

  // Add Book Mutation
  const addBookMutation = useMutation({
    mutationFn: async (newBook) => {
      const res = await api.post('/books', newBook);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setShowAddModal(false);
      setTitle('');
      setAuthor('');
      setIsbn('');
      setTotalCopies(1);
      setFormError('');
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Failed to add book');
    },
  });

  // Update Book Mutation
  const updateBookMutation = useMutation({
    mutationFn: async ({ id, ...bookData }) => {
      const res = await api.put(`/books/${id}`, bookData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setEditingBook(null);
    },
  });

  // Delete Book Mutation
  const deleteBookMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/books/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete book');
    },
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    addBookMutation.mutate({ title, author, isbn, totalCopies: Number(totalCopies) });
  };

  const handleDelete = (id, bookTitle) => {
    if (window.confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
      deleteBookMutation.mutate(id);
    }
  };

  const filteredBooks = books?.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn.includes(search)
  ) || [];

  // Pagination calculations
  const totalRecords = filteredBooks.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Library Catalog</h1>
          <p className="text-slate-600 mt-1">Browse available books and inventory records. Talk to a librarian to borrow.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by title, author, ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-72 text-sm"
          />
          {user?.role === 'librarian' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium whitespace-nowrap transition text-sm"
            >
              Add Book
            </button>
          )}
        </div>
      </div>

      {isLoading && <div className="text-slate-500 py-12 text-center">Loading catalog inventory...</div>}
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md">Error loading books.</div>}

      {!isLoading && !error && (
        <>
          {filteredBooks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              <p className="text-sm">No books matching your search query.</p>
            </div>
          ) : (
            <>
              {/* Books Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentBooks.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{book.title}</h3>
                      <p className="text-slate-600 text-sm mb-4">
                        by <span className="font-medium text-slate-700">{book.author}</span>
                      </p>
                      <div className="text-xs text-slate-400 space-y-1 mb-6">
                        <p>ISBN: {book.isbn}</p>
                        <p>Total Copies: {book.totalCopies}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            book.availableCopies > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Out of Stock'}
                        </span>

                        {user && user.role === 'librarian' && book.availableCopies > 0 && (
                          <button
                            onClick={() => setCheckoutBook(book)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition font-medium"
                          >
                            Process Loan
                          </button>
                        )}
                      </div>

                      {user && user.role === 'librarian' && (
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setEditingBook(book)}
                            className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(book._id, book.title)}
                            disabled={deleteBookMutation.isPending}
                            className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded transition disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <div>
                  Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-slate-700">
                    {Math.min(startIndex + itemsPerPage, totalRecords)}
                  </span>{' '}
                  of <span className="font-semibold text-slate-700">{totalRecords}</span> books
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <span className="px-2 font-medium text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center px-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Book</h2>
            {formError && <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-md">{formError}</div>}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1">ISBN</label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1">Total Copies</label>
                <input
                  type="number"
                  min="1"
                  value={totalCopies}
                  onChange={(e) => setTotalCopies(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-md text-slate-600 hover:bg-slate-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addBookMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
                >
                  {addBookMutation.isPending ? 'Saving...' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      <EditBookModal
        book={editingBook}
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
        onSave={(updatedData) => updateBookMutation.mutateAsync(updatedData)}
        isSubmitting={updateBookMutation.isPending}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        book={checkoutBook}
        onClose={() => setCheckoutBook(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['books'] });
          queryClient.invalidateQueries({ queryKey: ['myLoans'] });
        }}
      />
    </div>
  );
}