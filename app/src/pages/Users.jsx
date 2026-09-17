import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';

export default function Users() {
  const queryClient = useQueryClient();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = Create Mode, Object = Edit Mode

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'member',
  });
  const [formError, setFormError] = useState('');

  const itemsPerPage = 10;

  // 1. Fetch Users Query
  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data;
    },
  });

  // 2. Create User Mutation
  const createMutation = useMutation({
    mutationFn: async (newUser) => {
      const res = await api.post('/users', newUser);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Failed to create user');
    },
  });

  // 3. Update User Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/users/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Failed to update user');
    },
  });

  // 4. Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await api.delete(`/users/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete user');
    },
  });

  // Open modal for Creating
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'member' });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'member' });
    setFormError('');
  };

  // Delete Handler
  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      deleteMutation.mutate(user._id);
    }
  };

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (editingUser) {
      // Update logic (omit password if empty)
      const payload = { username: formData.username, role: formData.role };
      if (formData.password.trim()) {
        payload.password = formData.password;
      }
      updateMutation.mutate({ id: editingUser._id, data: payload });
    } else {
      // Create logic
      if (!formData.username || !formData.password) {
        setFormError('Username and password are required');
        return;
      }
      createMutation.mutate(formData);
    }
  };

  // Client-side Filter & Pagination Calculations
  const filteredUsers = (users || []).filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const totalRecords = filteredUsers.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          Failed to load users: {error.response?.data?.message || error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage system access, create librarian accounts, and edit user roles.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition"
        >
          + Add New User
        </button>
      </div>

      {/* Users Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800">System Users</h3>
            <p className="text-xs text-slate-500 mt-0.5">Showing all registered library members and staff</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search username or role..."
                className="w-64 pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 whitespace-nowrap">
              {totalRecords} Total Users
            </span>
          </div>
        </div>

        {/* Table Data */}
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No users match your criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="px-6 py-3.5">Username</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Created Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {currentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-medium text-slate-800">{user.username}</td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                            user.role === 'librarian'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                              : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deleteMutation.isPending && deleteMutation.variables === user._id}
                          className="px-3 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
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

      {/* Modal for Create/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="e.g. john_doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password {editingUser && <span className="text-slate-400 font-normal">(Leave blank to keep existing)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder={editingUser ? '••••••••' : 'Enter password'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="member">Member</option>
                  <option value="librarian">Librarian</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingUser
                    ? 'Update User'
                    : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}