'use client';

import { useState } from 'react';
import { ReadingStatus } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface StatusToggleProps {
  chapterId: number;
  initialStatus: ReadingStatus;
}

const statuses: { value: ReadingStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
];

export default function StatusToggle({ chapterId, initialStatus }: StatusToggleProps) {
  const [status, setStatus] = useState<ReadingStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function updateStatus(newStatus: ReadingStatus) {
    if (newStatus === status) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      user_id: user.id,
      chapter_id: chapterId,
      status: newStatus,
    };

    if (newStatus === 'in_progress' && status === 'not_started') {
      updates.started_at = now;
    }
    if (newStatus === 'completed') {
      updates.completed_at = now;
      if (status === 'not_started') {
        updates.started_at = now;
      }
    }

    await supabase
      .from('reading_progress')
      .upsert(updates, { onConflict: 'user_id,chapter_id' });

    setStatus(newStatus);
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-warm-100 p-1">
      {statuses.map((s) => (
        <button
          key={s.value}
          onClick={() => updateStatus(s.value)}
          disabled={saving}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            status === s.value
              ? 'bg-white text-charcoal shadow-sm'
              : 'text-warm-500 hover:text-charcoal'
          } disabled:opacity-50`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
