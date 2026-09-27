# Protected route group

This directory reserves a Next.js route group for pages that require a signed-in user. Parentheses do not add a URL segment, and the group name itself does not enforce authentication. Every page or action must use the project's auth checks and rely on Supabase Row Level Security for data access.

There are no protected pages in this group yet. Current routes perform authorization in their server actions and data boundaries.
