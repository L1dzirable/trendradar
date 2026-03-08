import { useState } from 'react';
import { X, Share2, Twitter, Linkedin, Link2, Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { trackOpportunityShare } from '../lib/analytics';
import { useAuth } from '../contexts/AuthContext';

interface ShareModalProps {
  opportunityId: string;
  opportunityTitle: string;
  onClose: () => void;
}

export function ShareModal({ opportunityId, opportunityTitle, onClose }: ShareModalProps) {
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateShareLink() {
    setIsGenerating(true);
    setError(null);

    try {
      const { data: existing, error: checkError } = await supabase
        .from('shared_opportunities')
        .select('share_id')
        .eq('opportunity_id', opportunityId)
        .maybeSingle();

      if (checkError) throw checkError;

      let shareId: string;

      if (existing) {
        shareId = existing.share_id;
      } else {
        shareId = generateRandomId();

        const { error: insertError } = await supabase
          .from('shared_opportunities')
          .insert([{
            opportunity_id: opportunityId,
            share_id: shareId,
          }]);

        if (insertError) throw insertError;
      }

      const url = `${window.location.origin}/share/${shareId}`;
      setShareUrl(url);
    } catch (err) {
      console.error('Error generating share link:', err);
      setError('Failed to generate share link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  function generateRandomId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function copyToClipboard() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackOpportunityShare(opportunityId, 'copy_link', user?.id);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  function shareOnTwitter() {
    if (!shareUrl) return;

    const text = `Check out this startup opportunity: ${opportunityTitle}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
    trackOpportunityShare(opportunityId, 'twitter', user?.id);
  }

  function shareOnLinkedIn() {
    if (!shareUrl) return;

    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
    trackOpportunityShare(opportunityId, 'linkedin', user?.id);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Share Opportunity</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Share this opportunity with your network or save it for later
            </p>

            {!shareUrl && (
              <button
                onClick={generateShareLink}
                disabled={isGenerating}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Link...
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5" />
                    Generate Share Link
                  </>
                )}
              </button>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {shareUrl && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-900 dark:text-white font-mono break-all">{shareUrl}</p>
                </div>

                <button
                  onClick={copyToClipboard}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="w-5 h-5" />
                      Copy Link
                    </>
                  )}
                </button>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Share on social media</p>
                  <div className="flex gap-3">
                    <button
                      onClick={shareOnTwitter}
                      className="flex-1 px-4 py-3 bg-black dark:bg-gray-800 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Twitter className="w-5 h-5" />
                      X (Twitter)
                    </button>
                    <button
                      onClick={shareOnLinkedIn}
                      className="flex-1 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Linkedin className="w-5 h-5" />
                      LinkedIn
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
