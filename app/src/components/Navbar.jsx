import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';

export default function Navbar() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => await api.post('/auth/logout'),
    onSuccess: () => {
      queryClient.setQueryData(['authUser'], null);
      navigate('/login');
    }
  });

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold tracking-wide text-blue-400">LibraryApp</Link>
      <div className="space-x-6 flex items-center">
        <Link to="/" className="hover:text-blue-300 transition">Home</Link>
        <Link to="/catalog" className="hover:text-blue-300 transition">Catalog</Link>
        
        {user ? (
          <>
            <Link to="/dashboard" className="hover:text-blue-300 transition">Dashboard</Link>
            
            {/* Librarian-Only Nav Links */}
            {user.role === 'librarian' && (
              <>
                <Link to="/add-book" className="hover:text-blue-300 transition">Add Book</Link>
                <Link to="/register" className="hover:text-blue-300 transition">Register User</Link>
              </>
            )}

            <span className="text-sm text-slate-400">({user.username})</span>
            <button
              onClick={() => logoutMutation.mutate()}
              className="bg-red-600 px-3 py-1.5 rounded-md hover:bg-red-700 transition text-sm font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-300 transition">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}