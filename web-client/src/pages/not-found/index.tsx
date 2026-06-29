import { Link } from "react-router-dom";
import { Smartphone, HelpCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] px-6 text-center">
      {/* Brand logo */}
      <div className="flex items-center gap-2 mb-8 select-none">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
          <Smartphone className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          Call<span className="text-blue-600">Bridge</span>
        </span>
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-6">
        <HelpCircle className="h-8 w-8" />
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
        404 Error
      </p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-sm font-medium text-slate-400">
        The page you are looking for does not exist, has been removed, or is temporarily unavailable.
      </p>

      <div className="mt-8">
        <Link
          to="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 hover:bg-blue-700 active:bg-blue-800 transition-all duration-200"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
