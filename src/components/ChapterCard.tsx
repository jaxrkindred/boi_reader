import Link from 'next/link';
import { Chapter, ReadingStatus } from '@/lib/types';

interface ChapterCardProps {
  chapter: Chapter;
  status: ReadingStatus;
}

const statusConfig = {
  not_started: {
    label: 'Not Started',
    dotClass: 'bg-warm-300',
    bgClass: 'bg-white',
  },
  in_progress: {
    label: 'Reading',
    dotClass: 'bg-gold',
    bgClass: 'bg-white ring-2 ring-gold/20',
  },
  completed: {
    label: 'Completed',
    dotClass: 'bg-green-600',
    bgClass: 'bg-warm-50',
  },
};

export default function ChapterCard({ chapter, status }: ChapterCardProps) {
  const config = statusConfig[status];

  return (
    <Link
      href={`/chapters/${chapter.slug}`}
      className={`group block rounded-xl p-5 shadow-warm transition-all duration-200 hover:shadow-warm-lg hover:-translate-y-0.5 ${config.bgClass}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="font-serif text-sm font-medium text-warm-400">
          Chapter {chapter.id}
        </span>
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${config.dotClass}`} />
          <span className="text-xs text-warm-500">{config.label}</span>
        </div>
      </div>
      <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-gold transition-colors leading-snug">
        {chapter.title}
      </h3>
      <p className="mt-2 text-sm text-warm-600 leading-relaxed line-clamp-2">
        {chapter.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {chapter.keyConcepts.slice(0, 3).map((concept) => (
          <span
            key={concept}
            className="rounded-full bg-warm-100 px-2.5 py-0.5 text-xs text-warm-600"
          >
            {concept}
          </span>
        ))}
      </div>
    </Link>
  );
}
