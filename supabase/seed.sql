-- Seed: archive account + the five launch concepts + their discussions.
-- Votes are deliberately NOT seeded — support starts at genuine zero.
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000001', 'authenticated',
  'authenticated', 'archive@vroomview.local',
  extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
  '2026-06-28T12:00:00Z', '2026-06-28T12:00:00Z');

update public.profiles
  set username = 'vroomview_archive', display_name = 'The Archive',
      bio = 'Founding proposals, filed by the board itself.'
  where id = 'a0000000-0000-4000-8000-000000000001';

insert into public.concepts (id, author_id, title, summary, details, body_style, specs, tags, created_at, updated_at)
values ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Affordable AWD minivan proposal', 'A sub-$30k all-wheel-drive minivan for cold-climate families — sliding doors, a flat load floor, and a modest hybrid option instead of a giant battery.', 'Cold-climate families keep getting pushed into three-row SUVs when a minivan does the job better: lower floor, sliding doors, more usable space. This proposal pairs standard AWD with a modest hybrid system — enough electric assist for efficiency and low-speed torque, without the cost and weight of a large pack. The target is a real starting price under $30k, not a base trim that becomes $45k once optioned.',
  'Minivan', '[{"label": "Est. price", "value": "$29,500"}, {"label": "Range", "value": "560 mi"}, {"label": "Powertrain", "value": "Hybrid"}, {"label": "Drivetrain", "value": "AWD"}, {"label": "Seats", "value": "7"}]'::jsonb, array['Price', 'Safety', 'Environment'], '2026-06-29T15:30:00Z', '2026-06-29T15:30:00Z');

insert into public.concepts (id, author_id, title, summary, details, body_style, specs, tags, created_at, updated_at)
values ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Compact EV wagon concept', 'A small electric estate that prioritizes usable cargo height over a fastback roofline. Targeting real-world efficiency and a sane, repairable interior.', 'Most ''EV wagons'' are really jacked-up fastbacks that trade cargo height for a coupe roofline. This concept commits to a true estate profile: a long, tall, square load area you can actually stack boxes in. Efficiency and repairability come before 0–60 bragging rights, with a simple RWD layout and an interior designed to be fixed, not just replaced.',
  'Wagon', '[{"label": "Est. price", "value": "$34,000"}, {"label": "Range", "value": "300 mi"}, {"label": "Powertrain", "value": "EV"}, {"label": "Drivetrain", "value": "RWD"}, {"label": "Cargo", "value": "38 cu ft"}]'::jsonb, array['Environment', 'Design', 'Mileage'], '2026-07-01T09:10:00Z', '2026-07-01T09:10:00Z');

insert into public.concepts (id, author_id, title, summary, details, body_style, specs, tags, created_at, updated_at)
values ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Lightweight hybrid coupe redesign', 'Rethinking the affordable coupe around low mass: a small hybrid drivetrain, steel-and-aluminum body, and analog steering feel over screens.', 'Affordable coupes died partly because they got heavy. This redesign starts from a mass budget: a small hybrid drivetrain, a mixed steel-and-aluminum body, and steering tuned for feel instead of a giant touchscreen. The goal is a genuinely fun, frugal two-door that a new grad could actually afford to buy and insure.',
  'Coupe', '[{"label": "Est. price", "value": "$31,000"}, {"label": "Weight", "value": "2,650 lb"}, {"label": "Powertrain", "value": "Hybrid"}, {"label": "Drivetrain", "value": "FWD"}, {"label": "0\u201360", "value": "6.9 s"}]'::jsonb, array['Performance', 'Design', 'Reliability'], '2026-06-30T12:00:00Z', '2026-06-30T12:00:00Z');

insert into public.concepts (id, author_id, title, summary, details, body_style, specs, tags, created_at, updated_at)
values ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Efficient small-truck package', 'A right-sized pickup for people who actually haul light loads: a real 5-ft bed, unibody ride, and a frugal hybrid — not a lifted highway cruiser.', 'Most modern pickups are highway cruisers wearing work-truck styling. This package is deliberately small: a real five-foot bed, a car-like unibody ride, and a frugal hybrid drivetrain sized for light hauling — landscaping runs, home projects, bikes. Right-sized capability at a price that undercuts the midsize class.',
  'Truck', '[{"label": "Est. price", "value": "$27,000"}, {"label": "Payload", "value": "1,400 lb"}, {"label": "Powertrain", "value": "Hybrid"}, {"label": "Drivetrain", "value": "AWD"}, {"label": "Bed", "value": "5 ft"}]'::jsonb, array['Mileage', 'Price', 'Market fit'], '2026-06-28T18:45:00Z', '2026-06-28T18:45:00Z');

insert into public.concepts (id, author_id, title, summary, details, body_style, specs, tags, created_at, updated_at)
values ('c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Urban commuter hatch redesign', 'A tiny, tall city hatch built for tight parking and short trips — narrow footprint, big glass, swappable interior panels, and easy, cheap repairs.', 'City driving punishes big cars. This hatch is built narrow and tall for tight parking and short trips, with big glass for visibility and a modest battery sized for real urban range rather than road-trip range. Swappable interior panels and cheap, standardized repairs keep it on the road — and out of the scrapyard — for longer.',
  'Hatchback', '[{"label": "Est. price", "value": "$22,500"}, {"label": "Range", "value": "180 mi"}, {"label": "Powertrain", "value": "EV"}, {"label": "Drivetrain", "value": "FWD"}, {"label": "Length", "value": "150 in"}]'::jsonb, array['Price', 'Environment', 'Design'], '2026-07-01T06:00:00Z', '2026-07-01T06:00:00Z');

insert into public.comments (id, concept_id, author_id, body, tags, created_at, updated_at)
values ('d0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'AWD plus sliding doors at this price is the combo nobody actually sells. Take my money.', array['Price', 'Safety'], '2026-06-30T14:00:00Z', '2026-06-30T14:00:00Z');
insert into public.comments (id, concept_id, author_id, body, tags, created_at, updated_at)
values ('d0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Skipping the giant battery is the right call — a small hybrid kills range anxiety without the weight.', array['Environment', 'Mileage'], '2026-06-30T18:00:00Z', '2026-06-30T18:00:00Z');
insert into public.comments (id, concept_id, author_id, body, tags, created_at, updated_at)
values ('d0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Manufacturers keep claiming minivans don''t sell, but this exact niche is wide open.', array['Market fit'], '2026-07-01T05:00:00Z', '2026-07-01T05:00:00Z');
insert into public.comments (id, concept_id, author_id, body, tags, created_at, updated_at)
values ('d0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Cargo height over a fastback roofline — finally someone gets what a wagon is for.', array['Design'], '2026-07-01T11:00:00Z', '2026-07-01T11:00:00Z');
insert into public.comments (id, concept_id, author_id, body, tags, created_at, updated_at)
values ('d0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Is 300 mi real-world or optimistic? That single number makes or breaks this.', array['Mileage', 'Reliability'], '2026-07-01T12:00:00Z', '2026-07-01T12:00:00Z');
insert into public.comments (id, concept_id, author_id, body, tags, created_at, updated_at)
values ('d0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Low mass and analog steering feel? This is exactly the commuter I keep wishing existed.', array['Performance', 'Design'], '2026-06-30T14:00:00Z', '2026-06-30T14:00:00Z');
insert into public.comments (id, concept_id, author_id, body, tags, created_at, updated_at)
values ('d0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', '2,650 lb feels ambitious once you add real crash structure — curious how they hit it.', array['Safety', 'Reliability'], '2026-06-30T20:00:00Z', '2026-06-30T20:00:00Z');
insert into public.comments (id, concept_id, author_id, body, tags, created_at, updated_at)
values ('d0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'A real 5-ft bed and a unibody ride is all most buyers actually need. Perfect size.', array['Market fit'], '2026-06-29T13:00:00Z', '2026-06-29T13:00:00Z');
insert into public.comments (id, concept_id, author_id, body, tags, created_at, updated_at)
values ('d0000000-0000-4000-8000-000000000009', 'c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'If it clears 40 mpg it quietly eats the whole midsize truck segment.', array['Mileage', 'Price'], '2026-06-30T14:00:00Z', '2026-06-30T14:00:00Z');
insert into public.comments (id, concept_id, author_id, body, tags, created_at, updated_at)
values ('d0000000-0000-4000-8000-000000000010', 'c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', '1,400 lb payload is more than enough for home and yard runs.', array['Reliability'], '2026-06-30T16:00:00Z', '2026-06-30T16:00:00Z');
insert into public.comments (id, concept_id, author_id, body, tags, created_at, updated_at)
values ('d0000000-0000-4000-8000-000000000011', 'c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'The narrow footprint is the entire point in a dense city. Yes please.', array['Design', 'Environment'], '2026-07-01T08:00:00Z', '2026-07-01T08:00:00Z');
insert into public.comments (id, concept_id, author_id, body, tags, created_at, updated_at)
values ('d0000000-0000-4000-8000-000000000012', 'c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Swappable panels and cheap standard repairs is what ''sustainable'' should actually mean.', array['Environment', 'Reliability'], '2026-07-01T10:00:00Z', '2026-07-01T10:00:00Z');
