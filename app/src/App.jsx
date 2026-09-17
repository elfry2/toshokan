import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LibrarianRoute from './components/LibrarianRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Loans from './pages/Loans';
import Catalog from './pages/Catalog';
import AddBookForm from './components/AddBookForm';
import Users from './pages/Users';
import PublicCatalog from './pages/PublicCatalog';

export default function App() {
  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-950 font-sans antialiased m-0 p-0">
      <BrowserRouter>
        <Routes>
          {/* Public / Standalone Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/public-catalog" element={<PublicCatalog />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Layout Shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/loans" element={<Loans />} />
              <Route path="/catalog" element={<Catalog />} />

              {/* Librarian-Only Protected Routes */}
              <Route element={<LibrarianRoute />}>
                <Route path="/users" element={<Users />} />
                <Route path="/register" element={<Register />} />
                <Route path="/add-book" element={<AddBookForm />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}