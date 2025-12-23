
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";

interface RelatedProgramsProps {
    category: string;
    currentId: string;
}

export async function RelatedPrograms({ category, currentId }: RelatedProgramsProps) {
    // 1. Fetch by Category
    let programs = await prisma.program.findMany({
        where: {
            category,
            id: { not: currentId },
            approvalStatus: true,
        },
        take: 3,
        orderBy: { trendingScore: 'desc' },
        select: {
            id: true,
            programName: true,
            logoUrl: true,
            commissionRate: true,
            slug: true,
            commissionDuration: true,
        },
    });

    // 2. Fallback if not enough
    if (programs.length < 3) {
        const existingIds = [currentId, ...programs.map((p) => p.id)];
        const fallbackPrograms = await prisma.program.findMany({
            where: {
                id: { notIn: existingIds },
                approvalStatus: true,
            },
            orderBy: { trendingScore: 'desc' }, // Highest trend
            take: 3 - programs.length,
            select: {
                id: true,
                programName: true,
                logoUrl: true,
                commissionRate: true,
                slug: true,
                commissionDuration: true,
            },
        });
        programs = [...programs, ...fallbackPrograms];
    }

    if (programs.length === 0) return null;

    return (
        <section className="mt-24 border-t border-[var(--border)] pt-12">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                    More in {category}
                </h3>
                <Link
                    href="/"
                    className="text-sm font-medium text-[var(--accent-solid)] flex items-center gap-1 hover:gap-2 transition-all"
                >
                    View all <HiArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {programs.map((program) => (
                    <Link
                        key={program.id}
                        href={`/programs/${program.slug}`}
                        className="group block p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--accent-solid)] transition-all duration-300"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            {/* Logo */}
                            <div className="w-12 h-12 shrink-0 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-zinc-100 shadow-sm">
                                {program.logoUrl ? (
                                    <img
                                        src={program.logoUrl}
                                        alt={program.programName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xl font-bold text-zinc-400">
                                        {program.programName.charAt(0)}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h4 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-solid)] transition-colors line-clamp-1">
                                    {program.programName}
                                </h4>
                                <div className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
                                    <span className="text-[var(--accent-solid)] font-bold">{program.commissionRate}%</span>
                                    <span>{program.commissionDuration || 'Commission'}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
