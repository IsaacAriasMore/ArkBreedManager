-- ==========================================
-- ARKBREED SPECIES TABLE POLICIES
-- ==========================================

alter table public.species enable row level security;

drop policy if exists "Species full select" on public.species;
drop policy if exists "Species full insert" on public.species;
drop policy if exists "Species full update" on public.species;
drop policy if exists "Species full delete" on public.species;

create policy "Species full select"
on public.species
for select
to public
using (true);

create policy "Species full insert"
on public.species
for insert
to public
with check (true);

create policy "Species full update"
on public.species
for update
to public
using (true)
with check (true);

create policy "Species full delete"
on public.species
for delete
to public
using (true);