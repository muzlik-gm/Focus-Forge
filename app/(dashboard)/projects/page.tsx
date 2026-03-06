'use client';

import { useState, useEffect } from 'react';
import { AppWindow, Folder, Plus, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Project {
    id: string;
    name: string;
    description: string | null;
    type: string;
    apps: string[];
    color: string;
}

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('General');
    const [color, setColor] = useState('#3b82f6');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                setProjects(await res.json());
            }
        } catch {
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, type, color, apps: [] })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create project');

            setProjects([data, ...projects]);
            toast.success('Project created successfully');

            // Reset form
            setName('');
            setDescription('');
            setIsCreating(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-10">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-1 tracking-tight uppercase italic text-white">Projects</h1>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight">Your workspaces and focus areas</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="skeuo-button h-12 px-6"
                    >
                        <Plus className="w-4 h-4" />
                        CREATE PROJECT
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="skeuo-panel p-8 mb-10">
                    <h2 className="text-xl font-bold uppercase tracking-tight italic border-b border-zinc-800 pb-2 mb-6 text-white">Create New Project</h2>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Project Name</label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="skeuo-input w-full p-4 font-bold text-white text-base"
                                    placeholder="e.g., My Coding Project"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Category</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="skeuo-input w-full p-4 font-bold text-white text-base appearance-none cursor-pointer"
                                >
                                    <option className="bg-zinc-900">Software</option>
                                    <option className="bg-zinc-900">Design</option>
                                    <option className="bg-zinc-900">Research</option>
                                    <option className="bg-zinc-900">General</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Description (Optional)</label>
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="skeuo-input w-full p-4 font-medium text-white text-sm"
                                placeholder="Short description..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-zinc-800 pt-6">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="h-11 px-6 text-zinc-300 font-bold text-sm rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="skeuo-button h-11 px-8"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Project'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="w-10 h-10 animate-spin text-zinc-500" />
                </div>
            ) : projects.length === 0 && !isCreating ? (
                <div className="text-center py-20 skeuo-panel">
                    <div className="flex justify-center mb-6">
                        <div className="skeuo-icon-container w-16 h-16">
                            <Folder className="w-8 h-8 text-zinc-400" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold uppercase tracking-tight italic mb-2 text-white">No Projects Yet</h3>
                    <p className="text-zinc-500 font-bold uppercase text-xs mb-6">Create your first project to start organising your focus sessions.</p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="skeuo-button px-8"
                    >
                        <Plus className="w-4 h-4" />
                        CREATE PROJECT
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((proj) => (
                        <div
                            key={proj.id}
                            className="skeuo-card p-6 flex flex-col h-full cursor-pointer group"
                            onClick={() => router.push(`/projects/${proj.id}`)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 pr-4">
                                    <div className="text-[10px] font-bold uppercase tracking-tight text-zinc-500 mb-1">TYPE: {proj.type}</div>
                                    <h3 className="text-xl font-bold tracking-tight uppercase italic text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">{proj.name}</h3>
                                </div>
                                <div className="skeuo-icon-container w-10 h-10 flex-shrink-0">
                                    <AppWindow className="w-5 h-5 text-indigo-400" />
                                </div>
                            </div>

                            <p className="text-zinc-400 font-medium text-sm mb-6 line-clamp-2 flex-grow">
                                {proj.description || 'No description provided.'}
                            </p>

                            <div className="border-t border-zinc-800 pt-4 flex items-center justify-between mt-auto">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                    {proj.apps.length} App{proj.apps.length === 1 ? '' : 's'}
                                </div>
                                {/* Clean Arrow button matching new theme without broken shadows */}
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-500 transition-colors group-hover:text-white text-zinc-400">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    );
}
