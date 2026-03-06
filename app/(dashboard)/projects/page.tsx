'use client';

import { useState, useEffect } from 'react';
import { AppWindow, Folder, Plus, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Project {
    id: string;
    name: string;
    description: string | null;
    type: string;
    apps: string[];
    color: string;
}

export default function ProjectsPage() {
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
            toast.success('Project linked successfully');

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
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-black pb-8">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black mb-1 embossed-text tracking-tighter uppercase italic">Project_Nodes</h1>
                    <p className="text-black/50 text-[10px] font-black uppercase tracking-widest">Workspace Clustering</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="skeuo-button h-14 px-8 bg-black text-white border-4 border-black font-black uppercase tracking-tighter shadow-[4px_4px_0px_white] ring-2 ring-black hover:bg-zinc-800 transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2 inline-block" />
                        CREATE_NODE
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="skeuo-panel p-8 bg-white border-4 border-black shadow-[12px_12px_0px_black] ring-4 ring-black mb-10">
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic border-b-2 border-black pb-2 mb-6">Initialize_New_Project</h2>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-black/60 mb-2">Project_Designation</label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-zinc-50 border-4 border-black p-4 font-bold text-black outline-none focus:bg-white focus:ring-4 focus:ring-black/20 transition-all"
                                    placeholder="e.g., Orbital Defense System"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-black/60 mb-2">Classification_Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full bg-zinc-50 border-4 border-black p-4 font-bold text-black outline-none focus:bg-white appearance-none"
                                >
                                    <option>Software</option>
                                    <option>Design</option>
                                    <option>Research</option>
                                    <option>General</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-black/60 mb-2">Operational_Parameters (Optional)</label>
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-zinc-50 border-4 border-black p-4 font-bold text-black outline-none focus:bg-white focus:ring-4 focus:ring-black/20"
                                placeholder="Short description..."
                            />
                        </div>

                        <div className="flex justify-end gap-4 border-t-2 border-black pt-6">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="skeuo-button h-12 px-6 bg-zinc-100 text-black border-4 border-black font-black uppercase tracking-tighter shadow-[4px_4px_0px_black] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="skeuo-button h-12 px-8 bg-black text-white border-4 border-black font-black uppercase tracking-tighter shadow-[4px_4px_0px_white] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Deploy_Parameters'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="w-10 h-10 animate-spin text-black" />
                </div>
            ) : projects.length === 0 && !isCreating ? (
                <div className="text-center py-20 skeuo-panel bg-white border-4 border-black shadow-[12px_12px_0px_black] ring-4 ring-black relative overflow-hidden">
                    <Folder className="w-16 h-16 text-black/10 mx-auto mb-4" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-2">No_Projects_Found</h3>
                    <p className="text-black/50 font-bold uppercase text-[10px]">Create a project to map your focus data onto specific application grids.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((proj) => (
                        <div key={proj.id} className="skeuo-panel bg-white border-4 border-black shadow-[8px_8px_0px_black] hover:shadow-[12px_12px_0px_black] transform hover:-translate-y-1 transition-all group overflow-hidden relative p-8">
                            <div className="absolute top-0 right-0 w-16 h-16 border-l-4 border-b-4 border-black flex items-center justify-center bg-zinc-50">
                                <AppWindow className="w-6 h-6" style={{ color: proj.color || '#000' }} />
                            </div>

                            <div className="mb-6">
                                <div className="text-[9px] font-black uppercase tracking-widest text-black/50 mb-1">Type: {proj.type}</div>
                                <h3 className="text-2xl font-black tracking-tighter uppercase italic pr-12 line-clamp-2">{proj.name}</h3>
                            </div>

                            <p className="text-black/70 font-bold text-xs mb-8 line-clamp-3">
                                {proj.description || 'No operational parameters assigned.'}
                            </p>

                            <div className="border-t-2 border-black pt-4 flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase">
                                    {proj.apps.length} Linked_Apps
                                </div>
                                <button className="bg-black text-white p-2 border-2 border-black group-hover:bg-white group-hover:text-black transition-colors shadow-[2px_2px_0px_currentColor]">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
