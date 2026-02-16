import { ReadingStatus } from '@/lib/types';

interface ProgressBarProps {
  progress: Record<number, ReadingStatus>;
  totalChapters: number;
}

export default function ProgressBar({ progress, totalChapters }: ProgressBarProps) {
  const completed = Object.values(progress).filter((s) => s === 'completed').length;
  const inProgress = Object.values(progress).filter((s) => s === 'in_progress').length;
  const percentage = Math.round((completed / totalChapters) * 100);

  return (
    <div className="rounded-xl bg-white p-6 shadow-warm">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="font-serif text-lg font-semibold text-charcoal">
            Your Progress
          </h2>
          <p className="text-sm text-warm-500 mt-0.5">
            {completed} of {totalChapters} chapters completed
            {inProgress > 0 && ` · ${inProgress} in progress`}
          </p>
        </div>
        <span className="font-serif text-2xl font-bold text-gold">{percentage}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-warm-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
