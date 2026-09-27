# Protected route group

This App Router folder is reserved for routes that should require a signed-in
user. There are no protected pages or group layout here yet. A route group name
in parentheses does not appear in the URL and does not protect a page by
itself; add an explicit server-side session check before placing a private page
here. See the auth architecture note in VroomViewNotes before changing access
rules.
