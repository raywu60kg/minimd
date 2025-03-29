/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
}

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NoteRequest {
  title: string;
  content: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      const path = url.pathname.replace('/api/', '');
      
      switch (request.method) {
        case 'GET':
          if (path === 'notes') {
            const { results } = await env.DB.prepare(
              'SELECT * FROM notes ORDER BY updated_at DESC'
            ).all<Note>();
            return Response.json(results);
          }
          if (path.startsWith('notes/')) {
            const id = parseInt(path.replace('notes/', ''));
            const note = await env.DB.prepare(
              'SELECT * FROM notes WHERE id = ?'
            ).bind(id).first<Note>();
            if (!note) return new Response('Not found', { status: 404 });
            return Response.json(note);
          }
          break;
          
        case 'POST':
          if (path === 'notes') {
            const body = await request.json() as NoteRequest;
            const now = new Date().toISOString();
            
            const { success } = await env.DB.prepare(
              'INSERT INTO notes (title, content, created_at, updated_at) VALUES (?, ?, ?, ?)'
            ).bind(body.title, body.content, now, now).run();
            
            if (!success) {
              return new Response('Failed to create note', { status: 500 });
            }
            
            const { results } = await env.DB.prepare(
              'SELECT * FROM notes WHERE title = ? AND content = ? AND created_at = ?'
            ).bind(body.title, body.content, now).all<Note>();
            
            return Response.json(results[0]);
          }
          break;
          
        case 'PUT':
          if (path.startsWith('notes/')) {
            const id = parseInt(path.replace('notes/', ''));
            const body = await request.json() as NoteRequest;
            const now = new Date().toISOString();
            
            await env.DB.prepare(
              'UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?'
            ).bind(body.title, body.content, now, id).run();
            
            return Response.json({ id, title: body.title, content: body.content, updated_at: now });
          }
          break;
          
        case 'DELETE':
          if (path.startsWith('notes/')) {
            const id = parseInt(path.replace('notes/', ''));
            await env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();
            return new Response(null, { status: 204 });
          }
          break;
      }
      
      return new Response('Not found', { status: 404 });
    }
    
    // For development, return a simple HTML page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Minimd</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script type="module" src="/src/index.tsx"></script>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  },
}; 