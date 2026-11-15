-- Trailhead initial schema. See PLAN.md "Data model" and "Sync rule".
-- Every table has RLS on. Access rules live here, not in the front end.

-- ---------- profiles ----------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 40),
  unit         text not null default 'lb' check (unit in ('lb', 'kg')),
  created_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Create a profile row whenever someone signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- friendships ----------
-- One row per pair. Requester is `a`, the person asked is `b`.
create table public.friendships (
  a          uuid not null references public.profiles (id) on delete cascade,
  b          uuid not null references public.profiles (id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (a, b),
  check (a <> b)
);
alter table public.friendships enable row level security;

create function public.are_friends(x uuid, y uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.a = x and f.b = y) or (f.a = y and f.b = x))
  );
$$;

create policy "see own friendships" on public.friendships
  for select using (auth.uid() in (a, b));
create policy "send a request as yourself" on public.friendships
  for insert with check (auth.uid() = a and status = 'pending');
create policy "accept a request sent to you" on public.friendships
  for update using (auth.uid() = b) with check (auth.uid() = b and status = 'accepted');
create policy "either side can remove" on public.friendships
  for delete using (auth.uid() in (a, b));

create policy "read own profile or a friend's" on public.profiles
  for select using (auth.uid() = id or public.are_friends(auth.uid(), id));
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- workouts ----------
-- One row per workout; exercises/sets are JSON in the app's v2 shape.
-- Never hard-delete: `deleted` is a tombstone so offline devices can't resurrect rows.
create table public.workouts (
  id         text primary key,
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  date       timestamptz not null,
  finished   boolean not null default false,
  notes      text not null default '' check (char_length(notes) <= 2000),
  exercises  jsonb not null default '[]' check (jsonb_typeof(exercises) = 'array'),
  updated_at timestamptz not null,
  deleted    boolean not null default false
);
alter table public.workouts enable row level security;
create index workouts_user_updated on public.workouts (user_id, updated_at);

-- Owners only. Friends never read workouts directly; they get PRs via a function (M3.4).
create policy "owner reads" on public.workouts
  for select using (auth.uid() = user_id);
create policy "owner inserts" on public.workouts
  for insert with check (auth.uid() = user_id);
create policy "owner updates" on public.workouts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- No delete policy on purpose: deletes are tombstones (update deleted = true).

-- ---------- coach reviews ----------
-- Written only by the coach edge function (service role); users read their own.
create table public.coach_reviews (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  week_end   date not null,
  review     jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, week_end) -- enforces 1 review per user per week
);
alter table public.coach_reviews enable row level security;
create policy "owner reads reviews" on public.coach_reviews
  for select using (auth.uid() = user_id);
