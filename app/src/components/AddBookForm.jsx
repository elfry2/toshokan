import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios'; // Adjust path to your axios.js file

export default function AddBookForm() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    totalCopies: 1,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mutation using your pre-configured api instance
  const addBookMutation = useMutation({
    mutationFn: async (newBook) => {
      // baseURL ('http://localhost:5000/api') + '/books' = 'http://localhost:5000/api/books'
      const response = await api.post('/books', newBook);
      return response.data;
    },
    onSuccess: () => {
      setSuccess('Book added successfully!');
      setError('');
      setFormData({ title: '', author: '', isbn: '', totalCopies: 1 });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to add book');
      setSuccess('');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalCopies' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    addBookMutation.mutate({
      ...formData,
      availableCopies: formData.totalCopies,
    });
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Book</h2>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
          <input
            type="text"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies</label>
          <input
            type="number"
            name="totalCopies"
            min="1"
            value={formData.totalCopies}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={addBookMutation.isPending}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 disabled:opacity-50"
        >
          {addBookMutation.isPending ? 'Adding Book...' : 'Add Book'}
        </button>
      </form>
    </div>
  );
}