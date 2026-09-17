import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PublicCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  const { data: books = [], isLoading, isError } = useQuery({
    queryKey: ['public-books'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/books`);
      return res.data;
    },
  });

  // Extract unique genres dynamically if genre field exists, fallback gracefully
  const genres = ['all', ...new Set(books.map((b) => b.genre).filter(Boolean))];

  // Filter books by search and genre
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn?.includes(searchQuery);

    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-amber-50/60 text-slate-800 flex flex-col justify-between font-sans">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">📖</span>
            <span className="text-xl font-black text-slate-800 tracking-tight group-hover:text-sky-600 transition">
              toshokan<span className="text-amber-500">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-bold bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-full shadow-md shadow-sky-500/20 hover:scale-105 active:scale-95 transition"
            >
              Sign In 🚀
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        <div>
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200 shadow-sm mb-2">
            <span>📚</span> Public Collection
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Book Catalog
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Browse through our available collection of books and learning materials.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-amber-200/70 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, author, or ISBN..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition font-medium"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-3.5"
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

          {genres.length > 1 && (
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition ${
                    selectedGenre === genre
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Catalog Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : isError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold">
            Failed to load public catalog records.
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white/80 rounded-2xl border border-amber-200/70">
            <p className="text-slate-500 font-medium text-sm">No books found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => {
              // Direct schema properties with 0 fallbacks
              const totalCopies = book.totalCopies ?? 0;
              const availableCopies = book.availableCopies ?? 0;

              return (
                <div
                  key={book._id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl border border-amber-200/70 shadow-sm p-5 flex flex-col justify-between hover:border-amber-300 hover:shadow-md transition"
                >
                  <div className="space-y-2">
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 rounded-full">
                      {book.genre || 'General'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">by {book.author}</p>
                    <p className="text-[11px] text-slate-400 font-mono">ISBN: {book.isbn}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Available: </span>
                      <span
                        className={`font-black ${
                          availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {availableCopies} / {totalCopies}
                      </span>
                    </div>

                    <Link
                      to="/login"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs"
                    >
                      Borrow
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 text-center text-xs font-medium text-slate-500 border-t border-amber-200/60">
        &copy; {new Date().getFullYear()} Toshokan Library System. Happy Reading! 🎈
      </footer>
    </div>
  );
}