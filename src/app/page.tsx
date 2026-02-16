import { createClient } from '@/lib/supabase/server';
import { chapters } from '@/lib/chapters';
import { ReadingStatus } from '@/lib/types';
import Header from '@/components/Header';
import ProgressBar from '@/components/ProgressBar';
import ChapterCard from '@/components/ChapterCard';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let progress: Record<number, ReadingStatus> = {};

  if (user) {
    const { data } = await supabase
      .from('reading_progress')
      .select('chapter_id, status')
      .eq('user_id', user.id);

    if (data) {
      progress = Object.fromEntries(
        data.map((row) => [row.chapter_id, row.status as ReadingStatus])
      );
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold text-charcoal">
            The Beginning of Infinity
          </h2>
          <p className="mt-2 text-warm-600 max-w-2xl">
            by David Deutsch — Track your reading journey, explore companion resources,
            and discuss ideas with an AI companion shaped by Deutsch&apos;s thinking.
          </p>
        </div>

        <div className="mb-8">
          <ProgressBar
            progress={progress}
            totalChapters={chapters.length}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              status={progress[chapter.id] || 'not_started'}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
