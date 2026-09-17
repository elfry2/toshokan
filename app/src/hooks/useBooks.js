import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';

export function useBooks() {
  const queryClient = useQueryClient();

  // Fetch all books
  const booksQuery = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await api.get('/books');
      return res.data;
    },
  });

  // Create book
  const createBookMutation = useMutation({
    mutationFn: async (newBook) => {
      const res = await api.post('/books', newBook);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  // Update book
  const updateBookMutation = useMutation({
    mutationFn: async ({ id, ...bookData }) => {
      const res = await api.put(`/books/${id}`, bookData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  // Delete book
  const deleteBookMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/books/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  return {
    books: booksQuery.data || [],
    isLoading: booksQuery.isLoading,
    isError: booksQuery.isError,
    createBook: createBookMutation.mutateAsync,
    updateBook: updateBookMutation.mutateAsync,
    deleteBook: deleteBookMutation.mutateAsync,
    isSubmitting:
      createBookMutation.isPending ||
      updateBookMutation.isPending ||
      deleteBookMutation.isPending,
  };
}