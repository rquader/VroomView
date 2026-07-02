-- citext: case-insensitive text type (usernames compare case-insensitively at
-- the type level). moddatetime: trigger that stamps updated_at on UPDATE so
-- edit times come from the database clock, never from clients.
create extension if not exists citext with schema extensions;
create extension if not exists moddatetime with schema extensions;
