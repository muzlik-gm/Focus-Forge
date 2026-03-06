'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, AppWindow, Loader2, Plus, Trash2, Edit3, Check, X, Search, Globe } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Fuse from 'fuse.js';

interface Project {
    id: string;
    name: string;
    description: string | null;
    type: string;
    apps: string[];
    color: string;
    createdAt: string;
}

// Comprehensive dictionary of common applications and websites
const APP_DIRECTORY = [
    // IDEs & Developer Tools
    { name: 'VS Code', type: 'app', icon: 'Code' },
    { name: 'Visual Studio', type: 'app', icon: 'Code' },
    { name: 'IntelliJ IDEA', type: 'app', icon: 'Code' },
    { name: 'WebStorm', type: 'app', icon: 'Code' },
    { name: 'PyCharm', type: 'app', icon: 'Code' },
    { name: 'Android Studio', type: 'app', icon: 'Code' },
    { name: 'Xcode', type: 'app', icon: 'Code' },
    { name: 'Sublime Text', type: 'app', icon: 'Code' },
    { name: 'Cursor', type: 'app', icon: 'Code' },
    { name: 'Warp', type: 'app', icon: 'Terminal' },
    { name: 'iTerm2', type: 'app', icon: 'Terminal' },
    { name: 'Windows Terminal', type: 'app', icon: 'Terminal' },
    { name: 'Postman', type: 'app', icon: 'Api' },
    { name: 'Insomnia', type: 'app', icon: 'Api' },
    { name: 'Docker Desktop', type: 'app', icon: 'Server' },
    { name: 'GitHub Desktop', type: 'app', icon: 'Git' },

    // Design & Creative
    { name: 'Figma', type: 'app', icon: 'PenTool' },
    { name: 'Adobe Photoshop', type: 'app', icon: 'Image' },
    { name: 'Adobe Illustrator', type: 'app', icon: 'PenTool' },
    { name: 'Adobe Premiere Pro', type: 'app', icon: 'Video' },
    { name: 'Adobe After Effects', type: 'app', icon: 'Video' },
    { name: 'Blender', type: 'app', icon: 'Box' },
    { name: 'Unity', type: 'app', icon: 'Box' },
    { name: 'Unreal Engine', type: 'app', icon: 'Box' },

    // Communication & Productivity
    { name: 'Slack', type: 'app', icon: 'MessageSquare' },
    { name: 'Discord', type: 'app', icon: 'MessageSquare' },
    { name: 'Microsoft Teams', type: 'app', icon: 'MessageSquare' },
    { name: 'Zoom', type: 'app', icon: 'Video' },
    { name: 'Notion', type: 'app', icon: 'FileText' },
    { name: 'Obsidian', type: 'app', icon: 'FileText' },
    { name: 'Evernote', type: 'app', icon: 'FileText' },
    { name: 'Microsoft Word', type: 'app', icon: 'FileText' },
    { name: 'Microsoft Excel', type: 'app', icon: 'Table' },
    { name: 'Microsoft PowerPoint', type: 'app', icon: 'Presentation' },

    // Browsers
    { name: 'Google Chrome', type: 'app', icon: 'Globe' },
    { name: 'Firefox', type: 'app', icon: 'Globe' },
    { name: 'Safari', type: 'app', icon: 'Globe' },
    { name: 'Microsoft Edge', type: 'app', icon: 'Globe' },
    { name: 'Brave', type: 'app', icon: 'Globe' },
    { name: 'Arc', type: 'app', icon: 'Globe' },

    // Popular Websites / SaaS
    { name: 'github.com', type: 'website', icon: 'Globe' },
    { name: 'gitlab.com', type: 'website', icon: 'Globe' },
    { name: 'bitbucket.org', type: 'website', icon: 'Globe' },
    { name: 'stackoverflow.com', type: 'website', icon: 'Globe' },
    { name: 'aws.amazon.com', type: 'website', icon: 'Cloud' },
    { name: 'vercel.com', type: 'website', icon: 'Cloud' },
    { name: 'cloudflare.com', type: 'website', icon: 'Cloud' },
    { name: 'figma.com', type: 'website', icon: 'PenTool' },
    { name: 'notion.so', type: 'website', icon: 'FileText' },
    { name: 'chatgpt.com', type: 'website', icon: 'Cpu' },
    { name: 'claude.ai', type: 'website', icon: 'Cpu' },
    { name: 'linear.app', type: 'website', icon: 'CheckSquare' },
    { name: 'trello.com', type: 'website', icon: 'CheckSquare' },
    { name: 'jira.com', type: 'website', icon: 'CheckSquare' },
    { name: 'youtube.com', type: 'website', icon: 'Video' },
    { name: 'twitter.com', type: 'website', icon: 'MessageCircle' },
    { name: 'x.com', type: 'website', icon: 'MessageCircle' },
    { name: 'reddit.com', type: 'website', icon: 'MessageSquare' },
    { name: 'mail.google.com', type: 'website', icon: 'Mail' }
];

// Initialize Fuse inside component or at module level
const fuse = new Fuse(APP_DIRECTORY, {
    keys: ['name', 'type'],
    threshold: 0.3,
    includeMatches: true
});

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingProject, setDeletingProject] = useState(false);

    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editType, setEditType] = useState('');
    const [newApp, setNewApp] = useState('');

    // Autocomplete state
    const [searchResults, setSearchResults] = useState<typeof APP_DIRECTORY>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!id) return;
        fetchProject();
    }, [id]);

    useEffect(() => {
        // Handle click outside to close dropdown
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (!res.ok) {
                if (res.status === 404) return router.push('/projects');
                throw new Error('Failed to load');
            }
            const data = await res.json();
            setProject(data);
            setEditName(data.name);
            setEditDesc(data.description || '');
            setEditType(data.type);
        } catch {
            toast.error('Failed to load project');
            router.push('/projects');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!project) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, description: editDesc, type: editType })
            });
            if (!res.ok) throw new Error('Failed to save');
            const updated = await res.json();
            setProject(updated);
            setEditing(false);
            toast.success('Project updated');
        } catch {
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleAppSearch = (query: string) => {
        setNewApp(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const results = fuse.search(query).map(result => result.item);
        setSearchResults(results);
    };

    const handleAddApp = async (appName?: string) => {
        const appToAdd = appName || newApp.trim();
        if (!appToAdd || !project) return;

        // Prevent duplicates
        if (project.apps.some(a => a.toLowerCase() === appToAdd.toLowerCase())) {
            toast.error('App already linked to this project');
            return;
        }

        const updated = [...project.apps, appToAdd];
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apps: updated })
            });
            if (!res.ok) throw new Error('Failed to add app');
            const data = await res.json();
            setProject(data);
            setNewApp('');
            setSearchResults([]);
            setIsSearchFocused(false);
            toast.success(`Added ${appToAdd}`);
        } catch {
            toast.error('Failed to add app');
        }
    };

    const handleRemoveApp = async (appName: string) => {
        if (!project) return;
        const updated = project.apps.filter(a => a !== appName);
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apps: updated })
            });
            if (!res.ok) throw new Error('Failed to remove app');
            const data = await res.json();
            setProject(data);
            toast.success(`Removed ${appName}`);
        } catch {
            toast.error('Failed to remove app');
        }
    };

    const handleDeleteProject = async () => {
        if (!confirm('Delete this project? This cannot be undone.')) return;
        setDeletingProject(true);
        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Project deleted');
            router.push('/projects');
        } catch {
            toast.error('Failed to delete project');
            setDeletingProject(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
            {/* Back link */}
            <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
            </Link>

            {/* Header panel */}
            <div className="skeuo-panel p-6 mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <div className="space-y-3">
                                <input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="skeuo-input w-full text-xl font-bold text-white"
                                    placeholder="Project name..."
                                />
                                <select
                                    value={editType}
                                    onChange={e => setEditType(e.target.value)}
                                    className="skeuo-input text-sm font-medium text-white bg-zinc-900"
                                >
                                    <option>Software</option>
                                    <option>Design</option>
                                    <option>Research</option>
                                    <option>General</option>
                                </select>
                                <textarea
                                    value={editDesc}
                                    onChange={e => setEditDesc(e.target.value)}
                                    rows={3}
                                    className="skeuo-input w-full text-sm font-medium text-white resize-none"
                                    placeholder="Project description..."
                                />
                            </div>
                        ) : (
                            <>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                                    TYPE: {project.type}
                                </div>
                                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2 embossed-text line-clamp-2">
                                    {project.name}
                                </h1>
                                <p className="text-zinc-400 text-sm font-medium">
                                    {project.description || 'No description provided.'}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                        {editing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="skeuo-button h-9 px-4 text-white font-bold text-xs flex items-center gap-1.5"
                                >
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3" /> Save</>}
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="skeuo-card h-9 px-4 text-zinc-300 hover:text-white font-bold text-xs flex items-center gap-1.5 hover:bg-zinc-700 cursor-pointer transition-colors"
                                >
                                    <X className="w-3 h-3" /> Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="skeuo-card h-9 px-4 text-zinc-300 hover:text-white font-bold text-xs flex items-center gap-1.5 hover:bg-zinc-700 cursor-pointer transition-colors"
                                >
                                    <Edit3 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    onClick={handleDeleteProject}
                                    disabled={deletingProject}
                                    className="h-9 px-4 bg-red-900/40 border border-red-500/30 text-red-400 hover:bg-red-900/60 hover:text-red-300 font-bold text-xs flex items-center gap-1.5 rounded transition-colors disabled:opacity-50"
                                >
                                    {deletingProject ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Trash2 className="w-3 h-3" /> Delete</>}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Meta row */}
                <div className="pt-4 border-t border-zinc-800 flex flex-wrap gap-4 md:gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>{project.apps.length} App{project.apps.length !== 1 ? 's' : ''}</span>
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Linked Apps panel */}
            <div className="skeuo-panel p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white embossed-text">Linked Apps</h2>
                    <span className="text-xs text-zinc-500 font-medium">{project.apps.length} linked</span>
                </div>

                {/* Smart Autocomplete Search */}
                <div className="relative mb-6 z-50">
                    <div className="flex gap-3 relative">
                        <div className="relative flex-1" ref={searchRef}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
                            <input
                                value={newApp}
                                onChange={e => handleAppSearch(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleAddApp();
                                }}
                                className="skeuo-input w-full !pl-10 pr-4 text-sm text-white font-medium focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Search apps (VS Code) or websites (github.com)..."
                            />

                            {/* Dropdown Menu - Now completely aligned with the input wrapper */}
                            {isSearchFocused && newApp.trim() && (
                                <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-zinc-900 border border-zinc-700 shadow-2xl rounded-lg overflow-hidden z-30 max-h-64 overflow-y-auto">
                                    <div className="p-1 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-950/50 border-b border-zinc-800">
                                        Best Matches
                                    </div>

                                    {searchResults.length > 0 && searchResults.slice(0, 5).map(app => (
                                        <button
                                            key={app.name}
                                            onClick={() => handleAddApp(app.name)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800/50 last:border-0"
                                        >
                                            {app.type === 'website' ? (
                                                <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                            ) : (
                                                <AppWindow className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-white truncate">{app.name}</div>
                                                <div className="text-[10px] uppercase tracking-widest text-zinc-500">{app.type}</div>
                                            </div>
                                            <Plus className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                        </button>
                                    ))}

                                    {/* Option to add custom entry */}
                                    <button
                                        onClick={() => handleAddApp(newApp.trim())}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors text-left bg-blue-500/5 hover:bg-blue-500/10 border-t border-zinc-800"
                                    >
                                        <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                                            <Plus className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-blue-400 truncate">Add "{newApp}"</div>
                                            <div className="text-[10px] uppercase tracking-widest text-blue-500/60">Custom App/Website</div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => handleAddApp()}
                            className="skeuo-button px-5 text-white font-bold text-sm flex items-center gap-1.5 flex-shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>
                </div>

                {project.apps.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-700 rounded-lg">
                        <AppWindow className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-500 font-medium text-sm">No apps linked yet.</p>
                        <p className="text-zinc-600 text-xs mt-1">Search and add apps above to track focus time per app.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {project.apps.map((app) => {
                            // Determine if it was recognized in directory to show smart icon
                            const matchingEntry = APP_DIRECTORY.find(d => d.name.toLowerCase() === app.toLowerCase());
                            const isWebsite = matchingEntry?.type === 'website' || app.includes('.com') || app.includes('.org') || app.includes('.net') || app.includes('.app');

                            return (
                                <div key={app} className="skeuo-card flex items-center justify-between p-3 group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                                            {isWebsite ? <Globe className="w-4 h-4 text-zinc-400" /> : <AppWindow className="w-4 h-4 text-zinc-400" />}
                                        </div>
                                        <span className="font-bold text-sm text-zinc-200 truncate pr-2">{app}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveApp(app)}
                                        className="w-8 h-8 rounded flex items-center justify-center text-red-500/40 hover:bg-red-500/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                        title="Remove app"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
