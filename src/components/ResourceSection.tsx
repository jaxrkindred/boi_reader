'use client';

import { useState } from 'react';
import { Resource } from '@/lib/types';

interface ResourceSectionProps {
  title: string;
  resources: Resource[];
  defaultOpen?: boolean;
}

const typeIcons: Record<Resource['type'], string> = {
  podcast: '🎙️',
  video: '🎬',
  article: '📄',
  discussion: '💬',
};

export default function ResourceSection({
  title,
  resources,
  defaultOpen = false,
}: ResourceSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (resources.length === 0) return null;

  return (
    <div className="rounded-xl bg-white shadow-warm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-warm-50"
      >
        <h3 className="font-serif text-base font-semibold text-charcoal">
          {title}
        </h3>
        <svg
          className={`h-5 w-5 text-warm-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="border-t border-warm-100 px-5 py-3 space-y-3">
          {resources.map((resource, i) => (
            <a
              key={i}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-lg p-3 -mx-2 transition-colors hover:bg-warm-50"
            >
              <span className="text-lg mt-0.5">{typeIcons[resource.type]}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-charcoal group-hover:text-gold transition-colors text-sm">
                  {resource.title}
                </p>
                <p className="text-xs text-warm-500 mt-0.5">{resource.source}</p>
                <p className="text-sm text-warm-600 mt-1 leading-relaxed">
                  {resource.description}
                </p>
              </div>
              <svg
                className="h-4 w-4 mt-1 text-warm-300 group-hover:text-gold transition-colors flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
