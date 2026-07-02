-- concepts: the proposals. Data quality is law here, not UI hope: CHECK
-- constraints bound every field, and the tags containment check (<@) means
-- only the 8 review lenses can ever be stored.
create table public.concepts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null
    constraint title_length check (char_length(title) between 8 and 90),
  summary text not null
    constraint summary_length check (char_length(summary) between 20 and 300),
  details text
    constraint details_length check (details is null or char_length(details) <= 2000),
  body_style text not null
    constraint body_style_length check (char_length(body_style) between 3 and 24),
  -- flexible per-concept spec sheet: an array of {label, value} pairs.
  -- Shape is bounded here; field-level validation lives in the app layer.
  specs jsonb not null default '[]'::jsonb
    constraint specs_shape check (jsonb_typeof(specs) = 'array' and jsonb_array_length(specs) <= 8),
  tags text[] not null default '{}'
    constraint tags_are_lenses check (
      tags <@ array['Mileage','Price','Environment','Design','Performance','Reliability','Safety','Market fit']
      and cardinality(tags) <= 8
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- indexes mirror the real queries: the feed (newest first), an author's
-- concepts, body-style shelves, and lens filtering (GIN for array overlap).
create index concepts_created_at_idx on public.concepts (created_at desc);
create index concepts_author_id_idx on public.concepts (author_id);
create index concepts_body_style_idx on public.concepts (body_style);
create index concepts_tags_idx on public.concepts using gin (tags);

alter table public.concepts enable row level security;

create policy "Concepts are readable by everyone"
  on public.concepts for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can file concepts as themselves"
  on public.concepts for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Authors can update their own concepts"
  on public.concepts for update
  to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

create policy "Authors can delete their own concepts"
  on public.concepts for delete
  to authenticated
  using ((select auth.uid()) = author_id);

grant select on public.concepts to anon, authenticated;
grant insert, update, delete on public.concepts to authenticated;

create trigger set_concepts_updated_at
  before update on public.concepts
  for each row execute function extensions.moddatetime(updated_at);
