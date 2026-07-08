-- The Design Studio's output: a versioned, size-bounded design document.
-- The CHECK bounds shape and size only; the STRICT grammar validation
-- (M/L/Q/Z strokes, bounded coords, known skeleton ids) lives in the app
-- layer on BOTH write and read (lib/design.ts). kind:"studio" is the only
-- kind today; kind:"image" is reserved for a future photo pipeline
-- (Storage + moderation + copyright attestation) documented in team notes.
alter table public.concepts
  add column design jsonb
    constraint design_shape check (
      design is null or (
        jsonb_typeof(design) = 'object'
        and pg_column_size(design) <= 20000
      )
    );
