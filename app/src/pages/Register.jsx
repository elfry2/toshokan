import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: async (newUser) => {
      const res = await api.post('/auth/register', newUser);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data);
      navigate('/dashboard');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Registration failed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate({ username, password, role });
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Create Account</h2>
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
        <div className="mb-4">
          <label className="block text-slate-600 text-sm font-medium mb-2">Password</label>
          <input 
            type="password" 
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-slate-600 text-sm font-medium mb-2">Role</label>
          <select 
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="member">Member</option>
            <option value="librarian">Librarian</option>
          </select>
        </div>
        <button 
          type="submit" 
          disabled={registerMutation.isPending}
          className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
        >
          {registerMutation.isPending ? 'Creating Account...' : 'Register'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
        </p>
      </form>
    </div>
  );
}
