import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import { Link } from 'react-router-dom';

export default function Loans() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'returned'
  const itemsPerPage = 10;

  // Fetch current user details
  const { data: authUser } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    },
    staleTime: Infinity,
  });

  // Fetch loans data
  const { data: loans, isLoading: loansLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const res = await api.get('/loans');
      return res.data;
    },
  });

  // Fetch catalog books to calculate inventory stats
  const { data: books } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await api.get('/books');
      return res.data;
    },
  });

  // Return book mutation
  const returnMutation = useMutation({
    mutationFn: async (loanId) => {
      const res = await api.put(`/loans/${loanId}/return`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  const isLibrarian = authUser?.role === 'librarian';

  // Handler for return button with confirmation
  const handleReturn = (loan) => {
    const bookTitle = loan.book?.title || 'this book';
    const copyCode = loan.copyCode ? ` (Copy: ${loan.copyCode})` : '';

    if (window.confirm(`Are you sure you want to return "${bookTitle}"${copyCode}?`)) {
      returnMutation.mutate(loan._id);
    }
  };

  // Calculations for stats
  const activeLoansCount = loans?.filter((l) => l.status === 'active').length || 0;
  const returnedLoansCount = loans?.filter((l) => l.status === 'returned').length || 0;
  const totalBooksCount = books?.length || 0;

  // Filter loans based on search input & status selection
  const filteredLoans = (loans || []).filter((loan) => {
    // 1. Filter by Status
    if (statusFilter !== 'all' && loan.status !== statusFilter) {
      return false;
    }

    // 2. Filter by Search Query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const title = loan.book?.title?.toLowerCase() || '';
    const borrower = loan.user?.username?.toLowerCase() || '';
    const copyCode = String(loan.copyCode || '').toLowerCase();

    return title.includes(q) || borrower.includes(q) || copyCode.includes(q);
  });

  // Pagination calculations on filtered results
  const totalRecords = filteredLoans.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLoans = filteredLoans.slice(startIndex, startIndex + itemsPerPage);

  // Handlers for controls
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  if (loansLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {authUser?.username || 'User'}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLibrarian
              ? 'Here is an overview of library activity, active circulations, and system inventory.'
              : 'Track your borrowed books, active checkouts, and reading history.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition"
          >
            Browse Book Catalog
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isLibrarian ? 'Active Circulations' : 'My Active Books'}
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{activeLoansCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Catalog Books</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalBooksCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Access</p>
            <p className="text-lg font-bold text-slate-800 mt-2 capitalize">{authUser?.role || 'Member'}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loans Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {isLibrarian ? 'All Library Loan Records' : 'My Borrowed History'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isLibrarian ? 'Manage user checkouts and execute returns' : 'Review active books and return timelines'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Segmented Controls */}
            <div className="inline-flex bg-slate-200/60 p-1 rounded-lg text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => handleStatusFilterChange('all')}
                className={`px-3 py-1 rounded-md transition ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                All ({loans?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => handleStatusFilterChange('active')}
                className={`px-3 py-1 rounded-md transition ${
                  statusFilter === 'active'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                Active ({activeLoansCount})
              </button>
              <button
                type="button"
                onClick={() => handleStatusFilterChange('returned')}
                className={`px-3 py-1 rounded-md transition ${
                  statusFilter === 'returned'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                Returned ({returnedLoansCount})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={isLibrarian ? 'Search title, borrower, or copy...' : 'Search title or copy code...'}
                className="w-64 pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 whitespace-nowrap">
              {totalRecords} Total Records
            </span>
          </div>
        </div>

        {!loans || loans.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No loan history found in the system.</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No loans match your search/filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="px-6 py-3.5">Book Title</th>
                    {isLibrarian && <th className="px-6 py-3.5">Borrower</th>}
                    <th className="px-6 py-3.5">Checked Out</th>
                    <th className="px-6 py-3.5">Returned At</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {currentLoans.map((loan) => (
                    <tr key={loan._id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{loan.book?.title || 'Unknown Book'}</div>
                        <div className="text-xs font-mono text-slate-400">Copy #{loan.copyCode}</div>
                      </td>

                      {isLibrarian && (
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {loan.user?.username || 'Unknown User'}
                        </td>
                      )}

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : '-'}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString() : '-'}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                            loan.status === 'returned'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {loan.status !== 'returned' && (
                          <button
                            onClick={() => handleReturn(loan)}
                            disabled={returnMutation.isPending && returnMutation.variables === loan._id}
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                          >
                            {returnMutation.isPending && returnMutation.variables === loan._id
                              ? 'Returning...'
                              : 'Return Book'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
                <span className="font-semibold text-slate-700">
                  {Math.min(startIndex + itemsPerPage, totalRecords)}
                </span>{' '}
                of <span className="font-semibold text-slate-700">{totalRecords}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="px-2 font-medium text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}