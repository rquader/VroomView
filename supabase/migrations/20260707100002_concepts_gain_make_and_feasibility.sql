-- Two new optional fields on a proposal:
--  · make — the manufacturer the author thinks should build it. NULL is a
--    deliberate "any maker", not missing data.
--  · feasibility — the production case: why the author believes this could
--    actually be built. Bounded like `details`.
alter table public.concepts
  add column make text
    constraint make_length check (make is null or char_length(make) between 2 and 40),
  add column feasibility text
    constraint feasibility_length check (feasibility is null or char_length(feasibility) <= 2000);
