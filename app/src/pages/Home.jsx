import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50/60 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Playful Floating Shapes / Background Accents */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-yellow-200/60 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-sky-200/60 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-36 h-36 bg-pink-200/50 rounded-full blur-2xl pointer-events-none" />

      {/* Navigation Bar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl">📖</span>
          <span className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-sky-600 transition">
            toshokan<span className="text-amber-500">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/public-catalog"
            className="text-sm font-bold text-slate-700 hover:text-sky-600 px-4 py-2 rounded-full hover:bg-amber-100/60 transition"
          >
            Explore Books 🔍
          </Link>
          <Link
            to="/login"
            className="text-sm font-bold bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-full shadow-md shadow-sky-500/20 hover:scale-105 active:scale-95 transition"
          >
            Sign In 🚀
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="max-w-4xl w-full mx-auto px-6 flex flex-col items-center justify-center text-center space-y-6 relative z-10 my-auto py-12">
        {/* Playful Tag */}
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200/80 shadow-sm">
          <span>🌟</span> Your Gateway to Fun Learning
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight text-center">
          Where every book <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500">
            is a new adventure! ✨
          </span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed text-center">
          Discover magical tales, exciting adventures, and school textbooks! Search our library catalog anytime.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full">
          <Link
            to="/public-catalog"
            className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95 transition text-base flex items-center justify-center gap-2"
          >
            <span>📚</span> Browse Book Catalog
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold border-2 border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 hover:scale-105 active:scale-95 transition text-base flex items-center justify-center gap-2"
          >
            <span>🔐</span> Member Portal
          </Link>
        </div>

        {/* Friendly Feature Badges */}
        <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 shadow-sm text-center">
            <span className="text-2xl block mb-1">🔍</span>
            <h3 className="font-bold text-slate-800 text-sm">Easy Search</h3>
            <p className="text-xs text-slate-500 mt-0.5">Find books by title or genre in seconds.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 shadow-sm text-center">
            <span className="text-2xl block mb-1">📖</span>
            <h3 className="font-bold text-slate-800 text-sm">Rich Catalog</h3>
            <p className="text-xs text-slate-500 mt-0.5">Explore our wide selection of books anytime.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 shadow-sm text-center">
            <span className="text-2xl block mb-1">🎉</span>
            <h3 className="font-bold text-slate-800 text-sm">Always Free</h3>
            <p className="text-xs text-slate-500 mt-0.5">Explore catalog items anytime you want.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 text-center text-xs font-medium text-slate-500 relative z-10 border-t border-amber-200/60">
        &copy; {new Date().getFullYear()} Toshokan Library System. Happy Reading! 🎈
      </footer>
    </div>
  );
}