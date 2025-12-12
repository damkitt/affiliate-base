import { useState } from "react";
import Image from "next/image";
import { HiCheck, HiLink, HiArrowUpRight } from "react-icons/hi2";
import { FaXTwitter } from "react-icons/fa6";

interface SuccessModalProps {
  onClose: () => void;
  programName: string;
  slug?: string;
  logoUrl?: string;
}

export function SuccessModal({ onClose, programName, slug, logoUrl }: SuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const [ogImageLoaded, setOgImageLoaded] = useState(false);
  const [ogImageError, setOgImageError] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://affiliatebase.com';
  const shareUrl = `${baseUrl}/programs/${slug}`;
  const ogImageUrl = `${baseUrl}/programs/${slug}/opengraph-image`;

  // Updated Copy
  const shareText = `Just submitted the ${programName} affiliate program to @AffiliateBase! 🚀\n\nDiscover high-paying partner programs.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn" />
      <div className="relative w-full max-w-lg bg-[#0A0A0A] rounded-[32px] shadow-2xl p-8 flex flex-col items-center text-center animate-scaleIn border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto ring-1 ring-white/5">

        {/* Cinematic Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <div className="relative w-24 h-24 rounded-full bg-[#0F0F0F] flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse" />
          <HiCheck className="w-10 h-10 text-emerald-500 relative z-10" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight relative">
          Program Submitted
        </h2>
        <p className="text-zinc-400 mb-8 max-w-sm text-sm leading-relaxed">
          Thanks for submitting <span className="text-white font-medium">{programName}</span>. It is now under review and will be live on the platform shortly.
        </p>

        {/* Share Section */}
        {slug && (
          <div className="w-full space-y-6">
            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopy}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-white/10 transition-all group active:scale-[0.98]"
              >
                {copied ? <HiCheck className="w-5 h-5 text-emerald-500" /> : <HiLink className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />}
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">{copied ? "Copied!" : "Copy Link"}</span>
              </button>

              <button
                onClick={handleTwitterShare}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-white/10 transition-all group active:scale-[0.98]"
              >
                <FaXTwitter className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">Post to X</span>
              </button>
            </div>

            {/* Social Post Preview */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Preview</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              <div className="bg-black rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Card Header */}
                <div className="p-4 border-b border-white/5 bg-zinc-900/50">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {logoUrl ? (
                        <Image src={logoUrl} alt={programName} width={40} height={40} className="rounded-full object-cover" unoptimized />
                      ) : (
                        <span className="text-emerald-500 font-bold text-sm">{programName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm truncate">{programName}</span>
                        <span className="text-zinc-500 text-xs truncate">@{programName.toLowerCase().replace(/\s+/g, '')}</span>
                      </div>
                      <p className="text-zinc-300 text-xs mt-0.5 line-clamp-1">
                        Just joined @AffiliateBase!
                      </p>
                    </div>
                  </div>
                </div>

                {/* OG Image Container */}
                <div className="relative aspect-[1.91/1] bg-zinc-900 overflow-hidden group-hover:saturate-150 transition-all duration-500">
                  {!ogImageLoaded && !ogImageError && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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

                  {/* Fallback */}
                  {ogImageError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                        <span className="text-2xl">⚡️</span>
                      </div>
                      <p className="text-white font-medium">{programName}</p>
                      <p className="text-zinc-500 text-xs mt-1">on Affiliate Base</p>
                    </div>
                  )}
                </div>

                {/* Card Footer (Domain) */}
                <div className="bg-black/50 backdrop-blur-sm p-3 flex items-center justify-between border-t border-white/5">
                  <span className="text-xs text-zinc-500 font-medium">affiliatebase.com</span>
                  <HiArrowUpRight className="w-3 h-3 text-zinc-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all shadow-lg active:scale-[0.98] mt-8 text-sm tracking-wide"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
