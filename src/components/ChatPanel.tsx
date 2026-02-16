'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/lib/types';

interface ChatPanelProps {
  chapterId: number;
  chapterTitle: string;
  initialMessages: ChatMessage[];
}

export default function ChatPanel({
  chapterId,
  chapterTitle,
  initialMessages,
}: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      user_id: '',
      chapter_id: chapterId,
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          chapterId,
          chapterTitle,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: ChatMessage = {
        user_id: '',
        chapter_id: chapterId,
        role: 'assistant',
        content: '',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            const text = decoder.decode(value);
            assistantMessage.content += text;
            setMessages((prev) => [
              ...prev.slice(0, -1),
              { ...assistantMessage },
            ]);
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          user_id: '',
          chapter_id: chapterId,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-cream shadow-warm-lg transition-all hover:bg-charcoal/90 hover:scale-105"
      >
        <span className="font-serif text-lg">∞</span>
        <span className="text-sm font-medium">
          {isOpen ? 'Close' : 'Ask David'}
        </span>
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 flex h-[32rem] w-96 flex-col overflow-hidden rounded-2xl bg-white shadow-warm-lg border border-warm-200">
          {/* Header */}
          <div className="border-b border-warm-100 bg-warm-50 px-5 py-3">
            <h3 className="font-serif font-semibold text-charcoal">
              Ask David
            </h3>
            <p className="text-xs text-warm-500">
              Exploring Chapter {chapterId}: {chapterTitle}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <p className="font-serif text-lg text-warm-400">∞</p>
                  <p className="mt-2 text-sm text-warm-500 max-w-xs">
                    Ask a question about this chapter. I&apos;ll respond in the spirit
                    of David Deutsch&apos;s thinking — emphasizing good explanations,
                    fallibilism, and optimism.
                  </p>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-charcoal text-cream rounded-br-md'
                      : 'bg-warm-100 text-charcoal rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-warm-100 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-warm-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-warm-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-warm-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-warm-100 p-3">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about this chapter..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-warm-200 bg-warm-50 px-4 py-2.5 text-sm text-charcoal placeholder-warm-400 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-xl bg-charcoal px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90 disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
