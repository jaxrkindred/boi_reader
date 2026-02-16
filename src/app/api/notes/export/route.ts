import { createClient } from '@/lib/supabase/server';
import { getChapterById } from '@/lib/chapters';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Fetch all notes ordered by chapter
  const { data: notes } = await supabase
    .from('user_notes')
    .select('chapter_id, content, updated_at')
    .eq('user_id', user.id)
    .order('chapter_id', { ascending: true });

  // Fetch reading progress for context
  const { data: progress } = await supabase
    .from('reading_progress')
    .select('chapter_id, status, completed_at')
    .eq('user_id', user.id)
    .order('chapter_id', { ascending: true });

  const progressMap = new Map(
    progress?.map((p) => [p.chapter_id, p]) || []
  );

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let md = `# The Beginning of Infinity — Reading Notes\n\n`;
  md += `*by David Deutsch*\n\n`;
  md += `Exported on ${date}\n\n`;
  md += `---\n\n`;

  if (!notes || notes.length === 0) {
    md += `*No notes yet. Start reading and jotting down your thoughts!*\n`;
  } else {
    for (const note of notes) {
      const chapter = getChapterById(note.chapter_id);
      if (!chapter) continue;

      const prog = progressMap.get(note.chapter_id);
      const statusLabel = prog?.status === 'completed'
        ? 'Completed'
        : prog?.status === 'in_progress'
          ? 'In Progress'
          : 'Not Started';

      md += `## Chapter ${chapter.id}: ${chapter.title}\n\n`;
      md += `**Status:** ${statusLabel}`;
      if (note.updated_at) {
        const updated = new Date(note.updated_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        md += ` | **Last updated:** ${updated}`;
      }
      md += `\n\n`;
      md += `**Key concepts:** ${chapter.keyConcepts.join(', ')}\n\n`;
      md += `${note.content}\n\n`;
      md += `---\n\n`;
    }
  }

  // Add a summary footer useful for AI agents
  md += `## About This Book\n\n`;
  md += `"The Beginning of Infinity" by David Deutsch argues that all progress — scientific, moral, political, and artistic — results from a single human activity: the quest for good explanations. `;
  md += `Key themes include Popperian epistemology (knowledge grows through conjecture and criticism), fallibilism (all knowledge is provisional), `;
  md += `rational optimism (all problems are soluble given the right knowledge), the many-worlds interpretation of quantum mechanics, `;
  md += `and the cosmic significance of human knowledge creation.\n`;

  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="boi-reading-notes-${new Date().toISOString().split('T')[0]}.md"`,
    },
  });
}
