// Edit this file to change the default welcome note content
// created for every new user on signup.

export const WELCOME_NOTE_TITLE = "Welcome to CozyNote 👋";

// Rich-text content (React Quill HTML format).
// Use the editor in-app to draft changes, then paste the resulting HTML here.
export const WELCOME_NOTE_CONTENT = `<h2>Welcome to CozyNote! 🎉</h2><p>We're glad you're here. Here's a quick look at what you can do:</p><h3>✍️ Creating Notes</h3><p>Click the <strong>New Note</strong> button to start writing. Your notes save automatically as you type.</p><h3>📚 Organizing with Notebooks</h3><p>Group related notes into <strong>Notebooks</strong> to keep everything tidy and easy to find.</p><h3>🏷️ Tagging Notes</h3><p>Attach <strong>Tags</strong> to your notes so you can filter and locate them in seconds.</p><h3>📌 Pinning Important Notes</h3><p>Pin your most important notes to the top of the list so they're always within reach.</p><h3>🔍 Search</h3><p>Use the search bar to find any note instantly by title or content.</p><p><br></p><p>Happy writing! ✨</p>`;

// Plain-text version used for full-text search indexing.
export const WELCOME_NOTE_CONTENT_TEXT =
  "Welcome to CozyNote! 🎉 We're glad you're here. " +
  "Creating Notes — click New Note to start writing, notes save automatically. " +
  "Organizing with Notebooks — group related notes to keep everything tidy. " +
  "Tagging Notes — attach tags so you can filter and locate notes in seconds. " +
  "Pinning Important Notes — pin your most important notes to the top of the list. " +
  "Search — find any note instantly by title or content. " +
  "Happy writing! ✨";
