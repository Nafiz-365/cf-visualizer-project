import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, Bookmark, PenLine } from 'lucide-react';
import { Button } from './ui/Button';









interface BookmarkNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: string) => void;
    onSkip: () => void;
    problemName: string;
}

export function BookmarkNoteModal({
    isOpen,
    onClose,
    onSave,
    onSkip,
    problemName,
}: BookmarkNoteModalProps) {
    const [note, setNote] = useState('');

    React.useEffect(() => {
        if (!isOpen) setNote('');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm"
                style={{ background: 'var(--overlay-bg)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6"
                    style={{
                        background: 'var(--bg-app)',
                        border: '1px solid var(--glass-border)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                                <Bookmark size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-display font-bold text-text-app leading-tight">
                                    Bookmark Saved!
                                </h3>
                                <p className="text-[10px] font-mono text-muted-app uppercase tracking-widest mt-1">
                                    {problemName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors"
                        >
                            <XCircle size={20} className="text-muted-app" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-xs font-bold text-text-app uppercase tracking-wider mb-3">
                            <PenLine size={14} className="text-brand-primary" />
                            Add a Private Note <span className="text-muted-app/50 lowercase">(Optional)</span>
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Why did you bookmark this? E.g., 'Learn Segment Tree for this'"
                            className="w-full h-28 bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-text-app placeholder:text-white/20 focus:outline-none focus:border-brand-primary/50 transition-colors resize-none"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex-1 rounded-xl text-xs"
                            onClick={onSkip}
                        >
                            Skip Note
                        </Button>
                        <Button
                            className="flex-1 rounded-xl text-xs bg-brand-primary text-black hover:bg-brand-primary/90"
                            onClick={() => {
                                onSave(note);
                                setNote('');
                            }}
                            disabled={!note.trim()}
                        >
                            Save Note
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
