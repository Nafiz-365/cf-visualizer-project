import React, { useEffect, useState } from 'react';
import {
    Bookmark,
    Edit3,
    Trash2,
    Code2,
    ExternalLink,
    Search,
    Tag,
    X,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface BookmarkType {
    id: number;
    problem_id: string;
    problem_name: string;
    created_at: string;
}

interface NoteType {
    id: number;
    problem_id: string;
    note: string;
    created_at: string;
}

function BookmarksAndNotesImpl() {
    const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [noteDraft, setNoteDraft] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchData();

        const handleUpdate = () => {
            fetchData();
        };

        window.addEventListener('bookmarksUpdated', handleUpdate);
        return () =>
            window.removeEventListener('bookmarksUpdated', handleUpdate);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bRes, nRes] = await Promise.all([
                fetch('/api/bookmarks'),
                fetch('/api/notes'),
            ]);

            const bData = await bRes.json();
            const nData = await nRes.json();

            if (bData.success) {
                setBookmarks(bData.bookmarks);
            }
            if (nData.success) {
                const notesMap: Record<string, string> = {};
                nData.notes.forEach((n: NoteType) => {
                    notesMap[n.problem_id] = n.note;
                });
                setNotes(notesMap);
            }
        } catch (e) {
            console.error('Failed to fetch bookmarks/notes', e);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (problemId: string) => {
        try {
            await fetch(`/api/bookmarks/${problemId}`, { method: 'DELETE' });
            setBookmarks((prev) =>
                prev.filter((b) => b.problem_id !== problemId),
            );
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveNote = async (problemId: string) => {
        try {
            await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problemId, note: noteDraft }),
            });
            setNotes((prev) => ({ ...prev, [problemId]: noteDraft }));
            setEditingNote(null);
        } catch (e) {
            console.error(e);
        }
    };

    // Extract unique tags across all notes (only for active bookmarks)
    const allTags = React.useMemo(() => {
        const tags = new Set<string>();
        bookmarks.forEach((b) => {
            const note = notes[b.problem_id];
            if (note) {
                const matches = note.match(/#[\w-]+\b/g);
                if (matches) {
                    matches.forEach((m) =>
                        tags.add(m.substring(1).toLowerCase()),
                    );
                }
            }
        });
        return Array.from(tags).sort();
    }, [notes, bookmarks]);

    // Filter bookmarks
    const filteredBookmarks = React.useMemo(() => {
        const validActiveTags = Array.from(activeTags).filter((t) =>
            allTags.includes(t),
        );

        return bookmarks.filter((b) => {
            const note = notes[b.problem_id] || '';
            const searchLower = searchQuery.toLowerCase();

            const matchesSearch =
                b.problem_name.toLowerCase().includes(searchLower) ||
                b.problem_id.toLowerCase().includes(searchLower) ||
                note.toLowerCase().includes(searchLower);

            if (validActiveTags.length === 0) return matchesSearch;

            const noteTags = (note.match(/#[\w-]+\b/g) || []).map((t) =>
                t.substring(1).toLowerCase(),
            );
            const hasAllActiveTags = validActiveTags.every((t) =>
                noteTags.includes(t),
            );

            return matchesSearch && hasAllActiveTags;
        });
    }, [bookmarks, notes, searchQuery, activeTags, allTags]);

    const toggleTag = (tag: string) => {
        setActiveTags((prev) => {
            const next = new Set(prev);
            if (next.has(tag)) next.delete(tag);
            else next.add(tag);
            return next;
        });
    };

    const renderNoteWithTags = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(#[\w-]+\b)/g);
        return parts.map((part, i) => {
            if (part.startsWith('#')) {
                return (
                    <span
                        key={i}
                        className="inline-block px-1.5 py-0.5 mx-0.5 rounded text-[10px] font-black bg-brand-secondary/20 text-brand-secondary tracking-widest uppercase"
                    >
                        {part}
                    </span>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    if (loading) {
        return (
            <Card className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-white/5 rounded w-1/4"></div>
                    <div className="h-24 bg-white/5 rounded w-full"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl md:text-2xl font-display font-bold text-text-app flex items-center gap-3">
                    <Bookmark className="text-brand-secondary" />
                    My Saved Problems & Notes
                </h3>

                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-muted-app/60" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search notes or problems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-text-app placeholder:text-muted-app/50 focus:outline-none focus:border-brand-primary/50 transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-app hover:text-text-app"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {allTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-app uppercase tracking-widest mr-2">
                        <Tag size={12} /> Tags:
                    </div>
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-2.5 py-1 rounded text-[10px] font-black tracking-widest uppercase transition-colors ${
                                activeTags.has(tag)
                                    ? 'bg-brand-secondary text-black'
                                    : 'bg-white/10 text-muted-app hover:bg-white/20 hover:text-text-app'
                            }`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            )}

            {filteredBookmarks.length === 0 ? (
                <div className="text-center py-10 text-muted-app">
                    <Bookmark size={48} className="mx-auto opacity-20 mb-4" />
                    <p>
                        {bookmarks.length === 0
                            ? 'No problems saved yet.'
                            : 'No bookmarks match your search or filters.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookmarks.map((b) => (
                        <div
                            key={b.problem_id}
                            className="p-5 bg-white/5 border border-white/10 rounded-2xl"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h4 className="text-lg font-bold text-text-app flex items-center gap-2">
                                        <Code2
                                            size={16}
                                            className="text-brand-primary"
                                        />
                                        {b.problem_id} - {b.problem_name}
                                    </h4>
                                    <p className="text-xs text-muted-app mt-1">
                                        Saved on{' '}
                                        {new Date(
                                            b.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`https://codeforces.com/contest/${b.problem_id.replace(/\D/g, '')}/problem/${b.problem_id.replace(/[0-9]/g, '')}`}
                                        target="_blank"
                                        className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                    <button
                                        onClick={() =>
                                            handleRemoveBookmark(b.problem_id)
                                        }
                                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Note Section */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                {editingNote === b.problem_id ? (
                                    <div className="space-y-3">
                                        <textarea
                                            value={noteDraft}
                                            onChange={(e) =>
                                                setNoteDraft(e.target.value)
                                            }
                                            placeholder="Write your private note here (e.g., used BFS, failed edge cases...)"
                                            className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-text-app focus:outline-none focus:border-brand-secondary resize-none"
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setEditingNote(null)
                                                }
                                                className="px-4 py-1.5 text-xs rounded-lg"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={() =>
                                                    handleSaveNote(b.problem_id)
                                                }
                                                className="px-4 py-1.5 text-xs rounded-lg bg-brand-secondary border-none text-black font-bold"
                                            >
                                                Save Note
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="group relative">
                                        {notes[b.problem_id] ? (
                                            <p className="text-sm text-muted-app whitespace-pre-wrap leading-relaxed">
                                                {renderNoteWithTags(
                                                    notes[b.problem_id],
                                                )}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-muted-app italic opacity-50">
                                                No note added yet. Add #tags to
                                                organize!
                                            </p>
                                        )}
                                        <button
                                            onClick={() => {
                                                setEditingNote(b.problem_id);
                                                setNoteDraft(
                                                    notes[b.problem_id] || '',
                                                );
                                            }}
                                            className="absolute top-0 right-0 p-1.5 bg-white/10 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-secondary hover:text-black"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}

export const BookmarksAndNotes = React.memo(BookmarksAndNotesImpl);
