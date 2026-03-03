'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, Loader2, Check } from 'lucide-react';
import { post } from '@/lib/api-client';

interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (workspace: any) => void;
}

export function CreateWorkspaceModal({ isOpen, onClose, onSuccess }: CreateWorkspaceModalProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await post('/api/workspaces', { name });

            if (res.ok) {
                const data = await res.json();
                onSuccess?.(data.workspace);
                setName('');
                onClose();
            } else {
                const data = await res.json();
                setError(data.error?.message || 'Failed to create workspace');
            }
        } catch {
            setError('An error occurred while creating the workspace');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setError(null);
        onClose();
    };

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative skeuo-modal w-full max-w-md mx-4 p-8">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-3 embossed-text text-white">Create Workspace</h2>
                <p className="text-base text-zinc-300 mb-8">
                    Build a space for your team to focus together.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="ws-name" className="block text-sm font-medium text-zinc-300 mb-2">
                            Workspace Name
                        </label>
                        <div className="skeuo-input p-0 flex items-center relative">
                            <Building2 className="absolute left-4 w-5 h-5 text-zinc-400" />
                            <input
                                id="ws-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Productivity Team"
                                className="w-full bg-transparent pl-12 pr-4 py-3 text-white focus:outline-none"
                                required
                                disabled={loading}
                                autoFocus
                                minLength={2}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 skeuo-alert border-red-500/30 text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="skeuo-card hover:bg-zinc-800 flex-1 py-3 text-white font-medium transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="skeuo-button flex-1 py-3 text-white font-medium transition-all flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Workspace'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
