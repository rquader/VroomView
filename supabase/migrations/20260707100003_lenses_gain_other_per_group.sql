-- Each lens family gains an "Other" catch-all. Stored WITH its family name —
-- "Other (practicality)" / "Other (engineering)" / "Other (design)" — so the
-- flat tag strings stay unambiguous; the UI renders them as "Other" inside
-- their group. Both tables' containment CHECKs move to the 11-lens list.
alter table public.concepts drop constraint tags_are_lenses;
alter table public.concepts add constraint tags_are_lenses check (
  tags <@ array['Mileage','Price','Environment','Design','Performance','Reliability','Safety','Market fit','Other (practicality)','Other (engineering)','Other (design)']
  and cardinality(tags) <= 11
);

alter table public.comments drop constraint tags_are_lenses;
alter table public.comments add constraint tags_are_lenses check (
  tags <@ array['Mileage','Price','Environment','Design','Performance','Reliability','Safety','Market fit','Other (practicality)','Other (engineering)','Other (design)']
  and cardinality(tags) <= 11
);
