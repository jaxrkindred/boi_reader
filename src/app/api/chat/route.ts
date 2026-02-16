import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { getChapterById } from '@/lib/chapters';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildSystemPrompt(chapterId: number, chapterTitle: string, completedChapters: number[]) {
  const chapter = getChapterById(chapterId);
  const keyConcepts = chapter?.keyConcepts.join(', ') || '';

  const completedContext = completedChapters.length > 0
    ? `The reader has completed chapters: ${completedChapters.join(', ')} out of 18.`
    : 'The reader is just beginning the book.';

  return `You are an AI reading companion for "The Beginning of Infinity" by David Deutsch. You embody Deutsch's thinking style and philosophical approach.

Core principles to channel:
- EXPLANATIONS: Good explanations are hard to vary while still accounting for what they purport to explain. This is the key criterion for knowledge.
- FALLIBILISM: All knowledge is conjectural and open to revision. There are no authoritative sources — only good and bad explanations.
- OPTIMISM: All evils are caused by insufficient knowledge. Problems are soluble given the right knowledge. This is not naive hope but a rational stance.
- POPPERIAN EPISTEMOLOGY: Knowledge grows through conjecture and criticism, not induction. We cannot derive theories from observations alone.
- THE MULTIVERSE: Take the many-worlds interpretation seriously as the only good explanation of quantum phenomena.
- CONSTRUCTOR THEORY: Think about what transformations are possible and impossible, and why.
- UNIVERSALITY: Humans are universal explainers and constructors — this makes us cosmically significant.
- PROGRESS: There is no limit to what can be achieved through the growth of knowledge. We are at the beginning of infinity.

The reader is currently on Chapter ${chapterId}: "${chapterTitle}".
${keyConcepts ? `Key concepts in this chapter: ${keyConcepts}.` : ''}
${completedContext}

Guidelines:
- Respond thoughtfully, drawing on the themes of whichever chapter the reader is exploring.
- When appropriate, connect ideas across chapters they've already read.
- Encourage critical thinking — don't just explain, help them think through the ideas.
- Be conversational but intellectually rigorous. Avoid jargon-dropping without explanation.
- If the reader misunderstands a concept, gently correct through Socratic questioning rather than lecturing.
- Keep responses focused and concise (2-4 paragraphs typically). Expand when the question warrants depth.
- You can reference other thinkers (Popper, Turing, Darwin, etc.) that Deutsch builds upon.`;
}

export async function POST(request: Request) {
  try {
    const { message, chapterId, chapterTitle } = await request.json();

    if (!message || !chapterId) {
      return new Response('Missing required fields', { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Fetch recent chat history for context
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch completed chapters for cross-chapter context
    const { data: progressData } = await supabase
      .from('reading_progress')
      .select('chapter_id')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    const completedChapters = progressData?.map((p) => p.chapter_id) || [];

    // Build message history (reverse to chronological order)
    const history = (recentMessages || []).reverse().map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Save user message
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      chapter_id: chapterId,
      role: 'user',
      content: message,
    });

    // Call Claude with streaming
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: buildSystemPrompt(chapterId, chapterTitle, completedChapters),
      messages: [
        ...history,
        { role: 'user', content: message },
      ],
    });

    // Collect full response for saving
    let fullResponse = '';

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // Save assistant response
          await supabase.from('chat_messages').insert({
            user_id: user.id,
            chapter_id: chapterId,
            role: 'assistant',
            content: fullResponse,
          });

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
