import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { chapters, getChapterBySlug } from '@/lib/chapters';
import { ReadingStatus, ChatMessage } from '@/lib/types';
import Header from '@/components/Header';
import ResourceSection from '@/components/ResourceSection';
import StatusToggle from '@/components/StatusToggle';
import ChatPanel from '@/components/ChatPanel';
import NotesPanel from '@/components/NotesPanel';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return chapters.map((chapter) => ({ slug: chapter.slug }));
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let status: ReadingStatus = 'not_started';
  let chatMessages: ChatMessage[] = [];
  let noteContent = '';

  if (user) {
    const { data: progressData } = await supabase
      .from('reading_progress')
      .select('status')
      .eq('user_id', user.id)
      .eq('chapter_id', chapter.id)
      .single();

    if (progressData) {
      status = progressData.status as ReadingStatus;
    }

    const { data: messagesData } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('chapter_id', chapter.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (messagesData) {
      chatMessages = messagesData as ChatMessage[];
    }

    const { data: noteData } = await supabase
      .from('user_notes')
      .select('content')
      .eq('user_id', user.id)
      .eq('chapter_id', chapter.id)
      .single();

    if (noteData) {
      noteContent = noteData.content;
    }
  }

  const podcastResources = chapter.resources.filter((r) => r.type === 'podcast');
  const otherResources = chapter.resources.filter((r) => r.type !== 'podcast');

  const prevChapter = chapter.id > 1 ? chapters[chapter.id - 2] : null;
  const nextChapter = chapter.id < 18 ? chapters[chapter.id] : null;

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-warm-500 hover:text-gold transition-colors"
          >
            ← Back to all chapters
          </Link>
        </div>

        {/* Chapter header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-serif text-sm font-medium text-gold mb-1">
                Chapter {chapter.id}
              </p>
              <h1 className="font-serif text-3xl font-bold text-charcoal">
                {chapter.title}
              </h1>
              <p className="mt-3 text-warm-600 leading-relaxed max-w-xl">
                {chapter.description}
              </p>
            </div>
            <StatusToggle chapterId={chapter.id} initialStatus={status} />
          </div>
        </div>

        {/* Key Concepts */}
        <div className="mb-6">
          <h2 className="font-serif text-lg font-semibold text-charcoal mb-3">
            Key Concepts
          </h2>
          <div className="flex flex-wrap gap-2">
            {chapter.keyConcepts.map((concept) => (
              <span
                key={concept}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-warm-700 shadow-warm"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-4 mb-8">
          <ResourceSection
            title="Listen Along — ToKCast"
            resources={podcastResources}
            defaultOpen={true}
          />
          {otherResources.length > 0 && (
            <ResourceSection
              title="Go Deeper"
              resources={otherResources}
            />
          )}
        </div>

        {/* Notes */}
        <div className="mb-8">
          <NotesPanel chapterId={chapter.id} initialContent={noteContent} />
        </div>

        {/* Chapter navigation */}
        <div className="flex items-center justify-between border-t border-warm-200 pt-6">
          {prevChapter ? (
            <Link
              href={`/chapters/${prevChapter.slug}`}
              className="group flex items-center gap-2 text-sm text-warm-500 hover:text-gold transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="text-right">
                <p className="text-xs text-warm-400">Previous</p>
                <p className="font-medium">{prevChapter.title}</p>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextChapter ? (
            <Link
              href={`/chapters/${nextChapter.slug}`}
              className="group flex items-center gap-2 text-sm text-warm-500 hover:text-gold transition-colors text-right"
            >
              <div>
                <p className="text-xs text-warm-400">Next</p>
                <p className="font-medium">{nextChapter.title}</p>
              </div>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>

      {/* AI Chat */}
      <ChatPanel
        chapterId={chapter.id}
        chapterTitle={chapter.title}
        initialMessages={chatMessages}
      />
    </div>
  );
}
