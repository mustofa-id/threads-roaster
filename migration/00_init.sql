create table threads_roast (
	username varchar,
	lang varchar not null,
	result text,
	created_at timestamptz not null default now(),
	primary key (username, lang)
);

-- Turn on security
alter table "threads_roast" enable row level security;

-- Allow anonymous access
create policy "Allow public access"
	on threads_roast
	for select
	to anon
	using (true);

create policy "Allow public create"
	on threads_roast
	for insert
	to anon
	with check (true);
