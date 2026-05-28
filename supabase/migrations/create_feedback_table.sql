create table public.feedback (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  sentiment       text not null check (sentiment in ('positive', 'negative')),

  issue_tags      text[] default null,
  description     text default null,

  svg_storage_path text default null,
  svg_size_bytes  integer default null,

  mode            text not null check (mode in ('svg', 'html')),
  format          text not null,
  quality         integer,
  width           integer,
  height          integer,
  background      text,
  scale           numeric,

  locale          text,
  user_agent      text,
  referer         text,
  ip_hash         text,

  client_id       text
);

create index idx_feedback_created_at on public.feedback (created_at desc);
create index idx_feedback_sentiment  on public.feedback (sentiment);
create index idx_feedback_ip_hash    on public.feedback (ip_hash);

alter table public.feedback enable row level security;

create policy "no_anon_access" on public.feedback
  for all using (false);

insert into storage.buckets (id, name, public)
values ('feedback-svgs', 'feedback-svgs', false)
on conflict (id) do nothing;

create policy "feedback_svgs_service_role" on storage.objects
  for all using (
    bucket_id = 'feedback-svgs' and auth.role() = 'service_role'
  )
  with check (
    bucket_id = 'feedback-svgs' and auth.role() = 'service_role'
  );
