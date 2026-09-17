import { useState, useEffect, useRef } from 'react';
import { api } from '../api/axios';

export default function CheckoutModal({ book, onClose, onSuccess }) {
  if (!book) return null;

  const [members, setMembers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userQuery, setUserQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [copyCode, setCopyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setFetchingUsers(true);
        setError('');
        const res = await api.get('/users');
        const userList = Array.isArray(res.data) 
          ? res.data 
          : res.data.users || res.data.data || [];
        setMembers(userList);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(err.response?.data?.message || 'Could not load members list.');
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Helper to safely resolve display name and email across schema variations
  const getUserName = (m) => m?.username || m?.name || m?.fullName || 'User';
  const getUserEmail = (m) => m?.email || '';

  const filteredMembers = members.filter((m) => {
    const name = getUserName(m).toLowerCase();
    const email = getUserEmail(m).toLowerCase();
    const q = userQuery.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const selectUser = (user) => {
    const name = getUserName(user);
    const email = getUserEmail(user);
    
    setSelectedUser(user);
    // Safely format display string without undefined
    setUserQuery(email ? `${name} (${email})` : name);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen || filteredMembers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < filteredMembers.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev > 0 ? prev - 1 : filteredMembers.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      selectUser(filteredMembers[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Please select a member to borrow the book.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/loans', {
        bookId: book._id,
        userId: selectedUser._id,
        copyCode
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">
          Checkout: {book?.title || 'Selected Book'}
        </h2>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Select Borrower
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder={fetchingUsers ? 'Loading members...' : 'Search by username or email...'}
              value={userQuery}
              disabled={fetchingUsers}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setUserQuery(e.target.value);
                setSelectedUser(null);
                setHighlightedIndex(-1);
                setIsDropdownOpen(true);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {isDropdownOpen && !fetchingUsers && (
              <div 
                role="listbox" 
                className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg"
              >
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((m, index) => {
                    const isHighlighted = index === highlightedIndex || selectedUser?._id === m._id;
                    const name = getUserName(m);
                    const email = getUserEmail(m);

                    return (
                      <div
                        key={m._id}
                        tabIndex={0}
                        role="option"
                        aria-selected={selectedUser?._id === m._id}
                        onClick={() => selectUser(m)}
                        onFocus={() => setHighlightedIndex(index)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            selectUser(m);
                          }
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`px-3 py-2 text-xs cursor-pointer focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-inset outline-none transition ${
                          isHighlighted ? 'bg-blue-50 font-semibold text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-medium text-slate-800">{name}</div>
                        {email && <div className="text-slate-400">{email}</div>}
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-400">
                    {members.length === 0 ? 'No members returned from server' : 'No matching members'}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Copy Code / Barcode
            </label>
            <input
              type="text"
              placeholder="e.g. BK-88402"
              value={copyCode}
              onChange={(e) => setCopyCode(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedUser}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Checkout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}