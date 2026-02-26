'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Loader2, Check, Copy } from 'lucide-react';
import { post } from '@/lib/api-client';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteMemberModal({ isOpen, onClose, onSuccess }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
      const res = await post('/api/team/invite', { email });

      if (res.ok) {
        const data = await res.json();
        setInvitationLink(data.invitationLink);
        setEmail('');
        onSuccess?.();
      } else {
        const data = await res.json();
        setError(data.error?.message || 'Failed to send invitation');
      }
    } catch {
      setError('An error occurred while sending the invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (invitationLink) {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setInvitationLink(null);
    setCopied(false);
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

        <h2 className="text-2xl font-bold mb-3 embossed-text text-white">Invite Team Member</h2>
        <p className="text-base text-zinc-300 mb-8">
          Send an invitation to join your workspace
        </p>

        {!invitationLink ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="skeuo-input w-full pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
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
                    Sending...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="mb-6 skeuo-alert border-green-500/30">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Check className="w-6 h-6" />
                <span className="font-bold text-lg embossed-text">Invitation Created!</span>
              </div>
              <p className="text-base text-zinc-300 mt-2">
                Share this link with your team member:
              </p>
            </div>

            <div className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={invitationLink}
                  readOnly
                  className="skeuo-input flex-1 px-4 py-3 text-white focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="skeuo-card hover:bg-zinc-800 px-6 py-3 text-white font-medium transition-colors flex items-center gap-2 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="skeuo-button w-full py-4 text-white font-medium text-lg transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
