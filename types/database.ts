/**
 * Placeholder for Supabase-generated database types.
 *
 * There are NO tables yet (skeleton stage), so this schema is intentionally empty.
 * Once you create tables, regenerate this file so every query is fully typed:
 *
 *   # hosted project:
 *   npx supabase gen types typescript --project-id <your-project-ref> > types/database.ts
 *   # or local dev DB:
 *   npx supabase gen types typescript --local > types/database.ts
 *
 * The Supabase clients are typed with <Database>, so regenerating instantly gives
 * you autocomplete + type-safety across the whole app.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
