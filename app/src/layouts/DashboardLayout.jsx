import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path to your AuthContext

const APP_NAME = import.meta.env.VITE_APP_NAME || 'toshokan';

export default function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Access authenticated user state

    const handleLogout = async () => {
        if (logout) await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    // Check role safely
    const isLibrarian = user?.role === 'librarian';

    return (
        <div className="h-screen w-full bg-slate-50 flex overflow-hidden">
            {/* Sidebar fixed to full viewport height without overflow */}
            <aside className="w-64 min-w-[16rem] h-full bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-100 flex-none">
                    <h1 className="text-lg font-bold text-slate-800 tracking-tight my-0">
                        {APP_NAME}
                    </h1>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
                        {user?.role || 'Member'} Portal
                    </span>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    <Link
                        to="/catalog"
                        className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/catalog')
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Book Catalog
                    </Link>
                    {isLibrarian && (
                        <Link
                            to="/loans"
                            className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/loans')
                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            Loans
                        </Link>
                    )}
                    {isLibrarian && <Link
                        to="/users"
                        className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/users')
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Users
                    </Link>}
                    {/* Render controls conditionally based on role */}
                    {isLibrarian && (
                        <>
                            <div className="pt-4 pb-1 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Librarian Controls
                            </div>
                            <Link
                                to="/register"
                                className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/register')
                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                Register New User
                            </Link>
                            <Link
                                to="/add-book"
                                className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/add-book')
                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                Add New Book
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex-none">
                    <div className="flex items-center justify-between">
                        <div className="truncate pr-2">
                            <p className="text-sm font-semibold text-slate-700 truncate">
                                {user?.username || user?.name || 'User'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-xs text-red-600 hover:bg-red-50 p-1.5 rounded font-medium transition shrink-0"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full h-full overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}