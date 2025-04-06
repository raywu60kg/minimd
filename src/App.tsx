import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CodeMirror from '@uiw/react-codemirror';
import { vim } from '@replit/codemirror-vim';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubLight } from '@uiw/codemirror-theme-github';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const queryClient = new QueryClient();

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isVimMode, setIsVimMode] = useState(() => {
    const saved = localStorage.getItem('vimMode');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('vimMode', JSON.stringify(isVimMode));
  }, [isVimMode]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const response = await fetch('/api/notes');
    const data = await response.json() as Note[];
    setNotes(data);
  };

  const createNote = async () => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Note', content: '' }),
    });
    const newNote = await response.json() as Note;
    setNotes([newNote, ...notes]);
    setCurrentNote(newNote);
  };

  const updateNote = async (note: Note) => {
    await fetch(`/api/notes/${note.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    setNotes(notes.map(n => n.id === note.id ? note : n));
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    setNotes(notes.filter(n => n.id !== id));
    if (currentNote?.id === id) {
      setCurrentNote(null);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Minimd
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {isPreviewMode ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={() => setIsVimMode(!isVimMode)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {isVimMode ? 'Normal Mode' : 'Vim Mode'}
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <button
                onClick={createNote}
                className={`w-full mb-4 px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                New Note
              </button>
              <div className="space-y-2">
                {notes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => setCurrentNote(note)}
                    className={`p-3 rounded-lg cursor-pointer ${
                      currentNote?.id === note.id
                        ? isDarkMode
                          ? 'bg-gray-700 text-white'
                          : 'bg-blue-100 text-blue-900'
                        : isDarkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium truncate">{note.title}</div>
                    <div className="text-sm opacity-75">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              {currentNote ? (
                <div className="h-full">
                  <div className="flex justify-between items-center mb-4">
                    <input
                      type="text"
                      value={currentNote.title}
                      onChange={e => {
                        const updated = { ...currentNote, title: e.target.value };
                        setCurrentNote(updated);
                        updateNote(updated);
                      }}
                      className={`w-full px-4 py-2 rounded-lg ${
                        isDarkMode
                          ? 'bg-gray-800 text-white border-gray-700'
                          : 'bg-white text-gray-900 border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <button
                      onClick={() => deleteNote(currentNote.id)}
                      className={`ml-4 px-4 py-2 rounded-lg ${
                        isDarkMode
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="h-[calc(100vh-200px)]">
                    {isPreviewMode ? (
                      <div className={`h-full p-4 rounded-lg overflow-auto ${
                        isDarkMode
                          ? 'bg-gray-800 text-white'
                          : 'bg-white text-gray-900'
                      }`}>
                        <div className="prose dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {currentNote.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <CodeMirror
                        value={currentNote.content}
                        height="100%"
                        theme={isDarkMode ? oneDark : githubLight}
                        extensions={[
                          ...(isVimMode ? [vim()] : []),
                          markdown(),
                        ]}
                        onChange={value => {
                          const updated = { ...currentNote, content: value };
                          setCurrentNote(updated);
                          updateNote(updated);
                        }}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className={`h-full flex items-center justify-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Select a note or create a new one
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App; 