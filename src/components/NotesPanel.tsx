'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NotesPanelProps {
  chapterId: number;
  initialContent: string;
}

export default function NotesPanel({ chapterId, initialContent }: NotesPanelProps) {
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  const save = useCallback(async (text: string) => {
    setSaveStatus('saving');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (text.trim() === '') {
      // Delete the note if empty
      await supabase
        .from('user_notes')
        .delete()
        .eq('user_id', user.id)
        .eq('chapter_id', chapterId);
    } else {
      // Upsert: use a unique constraint on (user_id, chapter_id)
      // The schema doesn't have one yet, so we'll do select + insert/update
      const { data: existing } = await supabase
        .from('user_notes')
        .select('id')
        .eq('user_id', user.id)
        .eq('chapter_id', chapterId)
        .single();

      if (existing) {
        await supabase
          .from('user_notes')
          .update({ content: text, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_notes')
          .insert({ user_id: user.id, chapter_id: chapterId, content: text });
      }
    }
    setSaveStatus('saved');
  }, [supabase, chapterId]);

  useEffect(() => {
    // Don't trigger save on initial mount
    if (content === initialContent) return;

    setSaveStatus('unsaved');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(content), 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, initialContent, save]);

  return (
    <div className="rounded-xl bg-white shadow-warm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-warm-100">
        <h3 className="font-serif text-base font-semibold text-charcoal">
          Your Notes
        </h3>
        <span className="text-xs text-warm-400">
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && content.trim() !== '' && 'Saved'}
          {saveStatus === 'unsaved' && 'Unsaved'}
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Jot down your thoughts, questions, or key takeaways from this chapter..."
        className="w-full min-h-[10rem] resize-y border-0 bg-warm-50/50 px-5 py-4 text-sm text-charcoal placeholder-warm-400 focus:outline-none leading-relaxed"
      />
      <div className="px-5 py-2 border-t border-warm-100 bg-warm-50/30">
        <p className="text-xs text-warm-400">
          Notes auto-save as you type. Export all notes from the header menu.
        </p>
      </div>
    </div>
  );
}
