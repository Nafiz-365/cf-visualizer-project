import React, { useState } from 'react';
import {
    Activity,
    AlertTriangle,
    ArrowUp,
    Loader2,
    Lock,
    Rss,
    Swords,
    Trash2,
    UserPlus,
    Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { SocialCards } from '../SocialCards';
import { CompareModal } from '../CompareModal';









function SocialTabImpl({
    socialSubTab,
    setSocialSubTab,
    user,
    ratingHistory,
    submissions,
    blogs,
}: any) {
    const { userHandle } = useAuth();
    const [friends, setFriends] = useState<string[]>([]);
    const [friendInput, setFriendInput] = useState('');
    const [friendError, setFriendError] = useState('');
    const [isFriendsLoading, setIsFriendsLoading] = useState(false);
    const [compareFriend, setCompareFriend] = useState<string | null>(null);

    React.useEffect(() => {
        if (
            socialSubTab === 'friends' &&
            userHandle &&
            userHandle.toLowerCase() === user.handle.toLowerCase()
        ) {
            setIsFriendsLoading(true);
            fetch(`/api/friends/${userHandle}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) setFriends(data.friends);
                })
                .finally(() => setIsFriendsLoading(false));
        }
    }, [socialSubTab, userHandle, user.handle]);

    const handleAddFriend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!friendInput.trim() || !userHandle) return;
        setFriendError('');
        try {
            const res = await fetch(`/api/friends/${userHandle}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendHandle: friendInput.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                if (!friends.includes(friendInput.trim())) {
                    setFriends((prev) => [friendInput.trim(), ...prev]);
                }
                setFriendInput('');
            } else {
                setFriendError(data.error || 'Failed to add friend');
            }
        } catch (e) {
            console.error('Failed to add friend', e);
            setFriendError('Network error while adding friend');
        }
    };

    const handleRemoveFriend = async (friendHandle: string) => {
        if (!userHandle) return;
        try {
            const res = await fetch(
                `/api/friends/${userHandle}/${friendHandle}`,
                {
                    method: 'DELETE',
                },
            );
            const data = await res.json();
            if (data.success) {
                setFriends((prev) => prev.filter((f) => f !== friendHandle));
            }
        } catch (e) {
            console.error('Failed to remove friend', e);
        }
    };

    return (
        <>
            <div className="space-y-6 md:space-y-8">
                {/* Inner sub-tabs selector */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit">
                    <button
                        onClick={() => setSocialSubTab('cards')}
                        className={cn(
                            'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300',
                            socialSubTab === 'cards'
                                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                                : 'text-muted-app hover:text-text-app hover:bg-white/5',
                        )}
                    >
                        Share Achievements
                    </button>
                    <button
                        onClick={() => setSocialSubTab('stream')}
                        className={cn(
                            'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300',
                            socialSubTab === 'stream'
                                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                                : 'text-muted-app hover:text-text-app hover:bg-white/5',
                        )}
                    >
                        Community Stream & Stats
                    </button>
                    <button
                        onClick={() => setSocialSubTab('friends')}
                        className={cn(
                            'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2',
                            socialSubTab === 'friends'
                                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                                : 'text-muted-app hover:text-text-app hover:bg-white/5',
                        )}
                    >
                        <Users size={14} /> My Network
                    </button>
                </div>

                {socialSubTab === 'cards' ? (
                    <SocialCards
                        user={user}
                        ratingHistory={ratingHistory}
                        submissions={submissions}
                    />
                ) : socialSubTab === 'friends' ? (
                    userHandle &&
                    userHandle.toLowerCase() === user.handle.toLowerCase() ? (
                        <Card className="p-6 md:p-8">
                            <h3 className="text-xl md:text-2xl font-display font-bold text-text-app mb-6 flex items-center gap-3">
                                <Users className="text-brand-primary" />
                                My Friends Network
                            </h3>
                            <form
                                onSubmit={handleAddFriend}
                                className="flex gap-3 mb-2"
                            >
                                <input
                                    type="text"
                                    value={friendInput}
                                    onChange={(e) =>
                                        setFriendInput(e.target.value)
                                    }
                                    placeholder="Add Codeforces Handle..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-app focus:outline-none focus:border-brand-primary transition-colors"
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="rounded-xl px-6 text-xs flex items-center gap-2"
                                >
                                    <UserPlus size={14} /> Add Friend
                                </Button>
                            </form>
                            {friendError && (
                                <p className="text-red-400 text-xs mb-6 pl-2 flex items-center gap-1">
                                    <AlertTriangle size={12} /> {friendError}
                                </p>
                            )}
                            {!friendError && <div className="mb-8"></div>}

                            {isFriendsLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-muted-app" />
                                </div>
                            ) : friends.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {friends.map((friend) => (
                                        <div
                                            key={friend}
                                            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-primary/50 transition-colors"
                                        >
                                            <a
                                                href={`/dashboard/${friend}`}
                                                target="_blank"
                                                className="text-sm font-bold text-text-app hover:text-brand-primary transition-colors"
                                            >
                                                {friend}
                                            </a>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        setCompareFriend(friend)
                                                    }
                                                    title="Compare Stats"
                                                    className="p-2 text-muted-app hover:text-brand-secondary hover:bg-brand-secondary/10 rounded-xl transition-colors"
                                                >
                                                    <Swords size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleRemoveFriend(
                                                            friend,
                                                        )
                                                    }
                                                    title="Remove Friend"
                                                    className="p-2 text-muted-app hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-app">
                                    <Users
                                        size={48}
                                        className="mx-auto opacity-20 mb-4"
                                    />
                                    <p>
                                        No friends added yet. Start building
                                        your network!
                                    </p>
                                </div>
                            )}
                        </Card>
                    ) : (
                        <Card className="p-10 flex flex-col items-center justify-center text-center">
                            <Lock
                                size={48}
                                className="text-brand-primary opacity-50 mb-6"
                            />
                            <h3 className="text-xl font-display font-bold text-text-app mb-2">
                                Network Encrypted
                            </h3>
                            <p className="text-muted-app max-w-sm">
                                This friends network is private. You can only
                                view your own network by signing in.
                            </p>
                        </Card>
                    )
                ) : (
                    (() => {
                        const totalBlogUpvotes = blogs.reduce(
                            (sum: number, blog: any) => sum + blog.rating,
                            0,
                        );
                        const friendsCount = (user as any).friendOfCount || 0;

                        let karmaBadge = {
                            label: 'OBSERVER',
                            color: 'text-slate-400',
                            bg: 'bg-slate-400/10',
                            border: 'border-slate-400/20',
                        };
                        if ((user.contribution || 0) >= 100)
                            karmaBadge = {
                                label: 'COMMUNITY PILLAR',
                                color: 'text-amber-400',
                                bg: 'bg-amber-400/10',
                                border: 'border-amber-400/20',
                            };
                        else if ((user.contribution || 0) > 0)
                            karmaBadge = {
                                label: 'ACTIVE NODE',
                                color: 'text-emerald-400',
                                bg: 'bg-emerald-400/10',
                                border: 'border-emerald-400/20',
                            };
                        else if ((user.contribution || 0) < 0)
                            karmaBadge = {
                                label: 'ROGUE ELEMENT',
                                color: 'text-red-400',
                                bg: 'bg-red-400/10',
                                border: 'border-red-400/20',
                            };

                        let fameBadge = {
                            label: 'STANDARD NODE',
                            color: 'text-slate-400',
                            bg: 'bg-slate-400/10',
                            border: 'border-slate-400/20',
                        };
                        if (friendsCount >= 1000)
                            fameBadge = {
                                label: 'LEGENDARY ENTITY',
                                color: 'text-purple-400',
                                bg: 'bg-purple-400/10',
                                border: 'border-purple-400/20',
                            };
                        else if (friendsCount >= 500)
                            fameBadge = {
                                label: 'FAMOUS NODE',
                                color: 'text-pink-400',
                                bg: 'bg-pink-400/10',
                                border: 'border-pink-400/20',
                            };
                        else if (friendsCount >= 100)
                            fameBadge = {
                                label: 'LOCAL HERO',
                                color: 'text-cyan-400',
                                bg: 'bg-cyan-400/10',
                                border: 'border-cyan-400/20',
                            };

                        return (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                                <div className="lg:col-span-8 space-y-6 md:space-y-8">
                                    <Card className="p-4 md:p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-display font-bold text-text-app">
                                                    COMMUNICATION INTERCEPTS
                                                </h3>
                                                <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.2em] mt-2 opacity-60">
                                                    Public blog entries and
                                                    announcements
                                                </p>
                                            </div>
                                            <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                                <Activity size={24} />
                                            </div>
                                        </div>

                                        {blogs.length > 0 ? (
                                            <div className="space-y-4 max-h-125 overflow-y-auto custom-scrollbar pr-2">
                                                {blogs.map((blog: any) => (
                                                    <div
                                                        key={blog.id}
                                                        className="p-4 md:p-5 rounded-xl bg-card-app border border-border-app hover:border-brand-primary/60 hover:shadow-[0_0_15px_rgba(0,238,255,0.2)] transition-all cursor-pointer group relative overflow-hidden"
                                                        onClick={() =>
                                                            window.open(
                                                                `https://codeforces.com/blog/entry/${blog.id}`,
                                                                '_blank',
                                                            )
                                                        }
                                                    >
                                                        {/* Radar Sweep Effect */}
                                                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-brand-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

                                                        <div className="flex items-center justify-between mb-2 relative z-10">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                                                                <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-widest">
                                                                    LOG //{' '}
                                                                    {format(
                                                                        new Date(
                                                                            blog.creationTimeSeconds *
                                                                                1000,
                                                                        ),
                                                                        'yyyy.MM.dd',
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                                                                <ArrowUp
                                                                    size={10}
                                                                />
                                                                {blog.rating}
                                                            </div>
                                                        </div>

                                                        <h4 className="text-sm md:text-base font-bold text-text-app group-hover:text-brand-primary transition-colors wrap-break-word whitespace-normal mb-3 relative z-10 font-mono">
                                                            &gt;{' '}
                                                            {blog.title.replace(
                                                                /<\/?[^>]+(>|$)/g,
                                                                '',
                                                            )}
                                                        </h4>

                                                        <div className="flex flex-wrap items-center gap-2 relative z-10">
                                                            {blog.tags.map(
                                                                (
                                                                    tag: string,
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            tag
                                                                        }
                                                                        className="text-[8px] md:text-[9px] font-mono px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary/80 border border-brand-primary/20 uppercase tracking-wider"
                                                                    >
                                                                        #{tag}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                                <Users
                                                    size={48}
                                                    className="text-muted-app opacity-20 mb-4"
                                                />
                                                <p className="text-sm font-medium text-muted-app">
                                                    No public blog entries found
                                                    for this user.
                                                </p>
                                            </div>
                                        )}
                                    </Card>
                                </div>

                                <div className="lg:col-span-4 space-y-8">
                                    <Card className="p-5 md:p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl" />
                                        <h3 className="text-sm font-black text-text-app uppercase tracking-widest mb-8">
                                            Social Influence HUD
                                        </h3>
                                        <div className="space-y-4 relative z-10">
                                            <div className="p-4 rounded-xl bg-card-app border border-border-app backdrop-blur-md relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary" />
                                                <div className="flex justify-between items-start pl-3">
                                                    <div>
                                                        <p className="text-[9px] font-mono font-bold text-muted-app uppercase tracking-widest mb-1">
                                                            Total Contribution
                                                        </p>
                                                        <div className="flex items-baseline gap-2">
                                                            <p className="text-2xl md:text-3xl font-display font-black text-text-app">
                                                                {user.contribution ||
                                                                    0}
                                                            </p>
                                                            <span
                                                                className={`text-[8px] px-1.5 py-0.5 rounded-sm border font-mono uppercase tracking-widest ${karmaBadge.color} ${karmaBadge.bg} ${karmaBadge.border}`}
                                                            >
                                                                {
                                                                    karmaBadge.label
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                                                        <Activity size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-card-app border border-border-app backdrop-blur-md relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                                                <div className="flex justify-between items-start pl-3">
                                                    <div>
                                                        <p className="text-[9px] font-mono font-bold text-muted-app uppercase tracking-widest mb-1">
                                                            Network Followers
                                                        </p>
                                                        <div className="flex items-baseline gap-2">
                                                            <p className="text-2xl md:text-3xl font-display font-black text-text-app">
                                                                {friendsCount}
                                                            </p>
                                                            <span
                                                                className={`text-[8px] px-1.5 py-0.5 rounded-sm border font-mono uppercase tracking-widest ${fameBadge.color} ${fameBadge.bg} ${fameBadge.border}`}
                                                            >
                                                                {
                                                                    fameBadge.label
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                                        <Users size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-card-app border border-border-app backdrop-blur-md relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                                                <div className="flex justify-between items-start pl-3">
                                                    <div>
                                                        <p className="text-[9px] font-mono font-bold text-muted-app uppercase tracking-widest mb-1">
                                                            Data Transmissions
                                                        </p>
                                                        <div className="flex items-baseline gap-2">
                                                            <p className="text-2xl md:text-3xl font-display font-black text-text-app">
                                                                {blogs.length}
                                                            </p>
                                                            <span className="text-[8px] px-1.5 py-0.5 rounded-sm border font-mono uppercase tracking-widest text-orange-400 bg-orange-400/10 border-orange-400/20">
                                                                {
                                                                    totalBlogUpvotes
                                                                }{' '}
                                                                UPVOTES
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                                                        <Rss size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-5 md:p-8">
                                        <h3 className="text-sm font-black text-text-app uppercase tracking-widest mb-8">
                                            Community Status
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                                <span className="text-[10px] font-bold text-muted-app uppercase">
                                                    Last Online
                                                </span>
                                                <span className="text-[10px] font-mono text-text-app font-bold">
                                                    {format(
                                                        new Date(
                                                            user.lastOnlineTimeSeconds *
                                                                1000,
                                                        ),
                                                        'MMM dd, HH:mm',
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                                <span className="text-[10px] font-bold text-muted-app uppercase">
                                                    Member Since
                                                </span>
                                                <span className="text-[10px] font-mono text-text-app font-bold">
                                                    {format(
                                                        new Date(
                                                            user.registrationTimeSeconds *
                                                                1000,
                                                        ),
                                                        'MMM dd, yyyy',
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        );
                    })()
                )}
            </div>
            <CompareModal
                isOpen={!!compareFriend}
                onClose={() => setCompareFriend(null)}
                myHandle={userHandle || user.handle}
                friendHandle={compareFriend || ''}
            />
        </>
    );
}

export const SocialTab = React.memo(SocialTabImpl);
