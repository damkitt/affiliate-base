import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiCheck, HiLink, HiArrowUpRight } from "react-icons/hi2";
import { FaXTwitter } from "react-icons/fa6";

interface SuccessModalProps {
  onClose: () => void;
  programName: string;
  slug?: string;
  logoUrl?: string;
}

export function SuccessModal({ onClose, programName, slug, logoUrl }: SuccessModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [ogImageLoaded, setOgImageLoaded] = useState(false);
  const [ogImageError, setOgImageError] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://affiliatebase.co';
  const shareUrl = `${baseUrl}/programs/${slug}`;
  const ogImageUrl = `${baseUrl}/programs/${slug}/opengraph-image`;

  const shareText = `🚀 ${programName} is now live on AffiliateBase.

Check commission rates, cookie duration, and partner terms here:

`;

  const handleCopyAnnouncement = () => {
    const textToCopy = `${shareText}${shareUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleBackToLeaders = () => {
    onClose();
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xl animate-fadeIn" />
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-[32px] shadow-[var(--shadow-premium)] p-8 flex flex-col items-center text-center animate-scaleIn border border-[var(--border)] overflow-hidden max-h-[90vh] overflow-y-auto ring-1 ring-[var(--border)]">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-[var(--accent-solid)]/5 blur-[100px] pointer-events-none" />

        <div className="relative w-24 h-24 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-8 border border-[var(--accent-solid)]/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]">
          <div className="absolute inset-0 rounded-full bg-[var(--accent-solid)]/10 animate-pulse" />
          <HiCheck className="w-10 h-10 text-[var(--accent-solid)] relative z-10" />
        </div>

        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3 tracking-tight relative">
          🚀 {programName} is Live!
        </h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-sm text-sm leading-relaxed">
          Your program is now listed on the leaderboard. Share this announcement to drive initial views and start climbing the ranks.
        </p>

        {slug && (
          <div className="w-full space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Preview</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
              </div>

              <div className="bg-[var(--bg)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-[var(--text-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {logoUrl ? (
                        <Image src={logoUrl} alt={programName} width={40} height={40} className="rounded-full object-cover" unoptimized />
                      ) : (
                        <span className="text-[var(--accent-solid)] font-bold text-sm">{programName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[var(--text-primary)] text-sm truncate">{programName}</span>
                        <span className="text-[var(--text-tertiary)] text-xs truncate">@{programName.toLowerCase().replace(/\s+/g, '')}</span>
                      </div>
                      <p className="text-[var(--text-secondary)] text-xs mt-0.5 line-clamp-1">
                        Just joined @AffiliateBase!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative aspect-[1.91/1] bg-[var(--bg-secondary)] overflow-hidden group-hover:saturate-150 transition-all duration-500">
                  {!ogImageLoaded && !ogImageError && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-6 h-6 border-2 border-[var(--accent-solid)] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {!ogImageError && (
                    <Image
                      src={ogImageUrl}
                      alt="Social Preview"
                      fill
                      className={`object-cover z-20 transition-all duration-700 ${ogImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                      unoptimized
                      onLoad={() => setOgImageLoaded(true)}
                      onError={() => setOgImageError(true)}
                    />
                  )}

                  {ogImageError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-secondary)] p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-[var(--text-primary)]/5 flex items-center justify-center mb-3">
                        <span className="text-2xl">⚡️</span>
                      </div>
                      <p className="text-[var(--text-primary)] font-medium">{programName}</p>
                      <p className="text-[var(--text-tertiary)] text-xs mt-1">on Affiliate Base</p>
                    </div>
                  )}
                </div>

                <div className="bg-[var(--bg)]/50 backdrop-blur-sm p-3 flex items-center justify-between border-t border-[var(--border)]">
                  <span className="text-xs text-[var(--text-tertiary)] font-medium">affiliatebase.co</span>
                  <HiArrowUpRight className="w-3 h-3 text-[var(--text-tertiary)]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyAnnouncement}
                className={`flex items-center justify-center gap-2 h-12 rounded-xl transition-all group active:scale-[0.98] border ${copied
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
                  : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white"
                  }`}
              >
                {copied ? (
                  <HiCheck className="w-4 h-4" />
                ) : (
                  <HiLink className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {copied ? "Copied" : "Share Link"}
                </span>
              </button>

              <button
                onClick={handleTwitterShare}
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition-all group active:scale-[0.98]"
              >
                <FaXTwitter className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Post to X
                </span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleBackToLeaders}
          className="mt-8 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Back to Leaderboard
        </button>
      </div>
    </div>
  );
}
