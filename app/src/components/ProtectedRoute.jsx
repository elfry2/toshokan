import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';

export default function ProtectedRoute({ allowedRoles }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh] text-slate-500">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
