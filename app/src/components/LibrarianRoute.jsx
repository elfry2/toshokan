// src/components/LibrarianRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed

export default function LibrarianRoute() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading session...
      </div>
    );
  }

  // If not logged in, or if not a librarian, redirect to login
  if (!isAuthenticated || user?.role !== 'librarian') {
    return <Navigate to="/login" replace />;
  }

  // Render child routes (Register, AddBookForm)
  return <Outlet />;
}