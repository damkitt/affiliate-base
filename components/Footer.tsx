import Link from "next/link";

interface FooterProps {
    onAddProgram?: () => void;
}

export function Footer({ onAddProgram }: FooterProps) {
    return (
        <footer className="w-full border-t border-[var(--border)] bg-[var(--bg-card)] mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    {/* Brand */}
                    <div className="max-w-xs">
                        <div className="mb-4">
                            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--text-secondary)]">
                                Affiliate <span className="text-[var(--accent-solid)]">Base</span>
                            </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            The most trusted directory of high-paying affiliate programs. Verified manually for quality and reliability.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-8 md:gap-12">
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wider">Platform</h3>
                            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                                <li>
                                    <Link href="/" className="hover:text-[var(--accent-solid)] transition-colors">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/advertise" className="hover:text-[var(--accent-solid)] transition-colors">
                                        Promote Your Program
                                    </Link>
                                </li>
                                {onAddProgram && (
                                    <li>
                                        <button
                                            onClick={onAddProgram}
                                            className="hover:text-[var(--accent-solid)] transition-colors text-left"
                                        >
                                            Add an Affiliate Program
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wider">Legal</h3>
                            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                                <li>
                                    <Link href="/terms" className="hover:text-[var(--accent-solid)] transition-colors">
                                        Terms & Privacy
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-tertiary)]">
                    <p>© {new Date().getFullYear()} Affiliate Base. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
