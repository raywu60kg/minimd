# Minimd

A minimalist markdown note-taking application with dark mode and vim keybindings, built with Cloudflare Workers and D1.

## Features

- 📝 Markdown note-taking with vim keybindings
- 🌓 Dark/Light mode support
- ⚡ Fast and responsive UI
- 🔄 Real-time updates
- 💾 Persistent storage with Cloudflare D1

## Prerequisites

- Node.js 18 or later
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/minimd.git
cd minimd
```

2. Install dependencies:
```bash
npm install
```

3. Create a Cloudflare D1 database:
```bash
wrangler d1 create minimd_db
```

4. Update the `wrangler.toml` file with your D1 database ID.

5. Create the database schema:
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

6. Deploy the application:
```bash
npm run deploy
```

## Development

To run the application locally:

```bash
npm run dev
```

## Usage

1. Create a new note by clicking the "New Note" button
2. Edit the note title and content
3. Use vim keybindings to navigate and edit
4. Toggle dark mode using the theme button
5. Delete notes using the delete button

## Vim Keybindings

- `i` - Enter insert mode
- `Esc` - Exit insert mode
- `h`, `j`, `k`, `l` - Navigate
- `w` - Move to next word
- `b` - Move to previous word
- `0` - Move to start of line
- `$` - Move to end of line
- `dd` - Delete line
- `yy` - Copy line
- `p` - Paste
- And more standard vim commands...

## License

MIT 