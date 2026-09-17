import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios'; // Adjust path to your axios.js file

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  // Fetch current user session from the backend
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const response = await api.get('/auth/current-user');
      return response.data;
    },
    retry: false, // Don't retry if unauthorized (401)
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const isAuthenticated = !!user;

  // Optional helper to manually invalidate/refetch user state (e.g., after login)
  const refetchUser = () => {
    queryClient.invalidateQueries({ queryKey: ['authUser'] });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume auth context easily
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}