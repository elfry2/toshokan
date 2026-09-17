import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data);
      if(data.role == 'librarian') navigate('/loans');
      else navigate('/catalog');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Invalid username or password');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md">
        <a class="bg-gray-400 text-white p-2 px-4 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50" href="/">Back to Home</a>
        <h2 className="pt-5 text-2xl font-bold mb-6 text-slate-800">Sign In</h2>
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md">{error}</div>}
        <div className="mb-4">
          <label className="block text-slate-600 text-sm font-medium mb-2">Username</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-slate-600 text-sm font-medium mb-2">Password</label>
          <input 
            type="password" 
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loginMutation.isPending}
          className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
        >
          {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
