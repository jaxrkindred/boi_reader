'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Header() {
  const supabase = createClient();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  function handleExportNotes() {
    window.location.href = '/api/notes/export';
  }

  return (
    <header className="border-b border-warm-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-charcoal text-cream font-serif font-bold text-lg">
            ∞
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-charcoal leading-tight">
              BOI Reader
            </h1>
            <p className="text-xs text-warm-500 leading-tight">
              The Beginning of Infinity
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportNotes}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-100 hover:text-charcoal"
            title="Export all notes as Markdown"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Notes
          </button>
          <button
            onClick={handleSignOut}
            className="rounded-lg px-4 py-2 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-100 hover:text-charcoal"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
