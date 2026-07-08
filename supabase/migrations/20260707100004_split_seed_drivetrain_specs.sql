-- The seed concepts' "Drivetrain" spec conflated two different facts: how the
-- car is POWERED (hybrid / EV — the powertrain) and which wheels are DRIVEN
-- (AWD / FWD / RWD — the drivetrain). Split it into two honest rows. ONLY the
-- five fixed-id seed rows are touched — user-authored posts are never
-- rewritten by a migration.
update public.concepts set specs = '[
  {"label": "Est. price", "value": "$29,500"},
  {"label": "Range", "value": "560 mi"},
  {"label": "Powertrain", "value": "Hybrid"},
  {"label": "Drivetrain", "value": "AWD"},
  {"label": "Seats", "value": "7"}
]'::jsonb where id = 'c0000000-0000-4000-8000-000000000001';

update public.concepts set specs = '[
  {"label": "Est. price", "value": "$34,000"},
  {"label": "Range", "value": "300 mi"},
  {"label": "Powertrain", "value": "EV"},
  {"label": "Drivetrain", "value": "RWD"},
  {"label": "Cargo", "value": "38 cu ft"}
]'::jsonb where id = 'c0000000-0000-4000-8000-000000000002';

update public.concepts set specs = '[
  {"label": "Est. price", "value": "$31,000"},
  {"label": "Weight", "value": "2,650 lb"},
  {"label": "Powertrain", "value": "Hybrid"},
  {"label": "Drivetrain", "value": "FWD"},
  {"label": "0–60", "value": "6.9 s"}
]'::jsonb where id = 'c0000000-0000-4000-8000-000000000003';

update public.concepts set specs = '[
  {"label": "Est. price", "value": "$27,000"},
  {"label": "Payload", "value": "1,400 lb"},
  {"label": "Powertrain", "value": "Hybrid"},
  {"label": "Drivetrain", "value": "AWD"},
  {"label": "Bed", "value": "5 ft"}
]'::jsonb where id = 'c0000000-0000-4000-8000-000000000004';

update public.concepts set specs = '[
  {"label": "Est. price", "value": "$22,500"},
  {"label": "Range", "value": "180 mi"},
  {"label": "Powertrain", "value": "EV"},
  {"label": "Drivetrain", "value": "FWD"},
  {"label": "Length", "value": "150 in"}
]'::jsonb where id = 'c0000000-0000-4000-8000-000000000005';
