-- BOI Reader Database Schema
-- Run this in the Supabase SQL editor to set up your database

-- Profiles table
create table if not exists public.profiles (
  user_id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Reading progress table
create type reading_status as enum ('not_started', 'in_progress', 'completed');

create table if not exists public.reading_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  chapter_id integer not null,
  status reading_status default 'not_started' not null,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  unique (user_id, chapter_id)
);

alter table public.reading_progress enable row level security;

create policy "Users can view their own progress"
  on public.reading_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.reading_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.reading_progress for update
  using (auth.uid() = user_id);

-- Chat messages table
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  chapter_id integer,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamptz default now() not null
);

alter table public.chat_messages enable row level security;

create policy "Users can view their own messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert their own messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

-- User notes table (future feature)
create table if not exists public.user_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  chapter_id integer not null,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, chapter_id)
);

alter table public.user_notes enable row level security;

create policy "Users can view their own notes"
  on public.user_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on public.user_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on public.user_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on public.user_notes for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_reading_progress_user on public.reading_progress (user_id);
create index if not exists idx_chat_messages_user_chapter on public.chat_messages (user_id, chapter_id, created_at);
create index if not exists idx_user_notes_user_chapter on public.user_notes (user_id, chapter_id);
