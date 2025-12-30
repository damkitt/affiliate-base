import { getLeaderboardPrograms, getActiveCategories } from "@/lib/data-fetching";
import HomeContent from "@/components/HomeContent";
import { getCategoryFromSlug, CATEGORY_SLUGS, getSlugFromCategory } from "@/constants";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { Category } from "@/types";

export const revalidate = 60;

interface PageProps {
    params: Promise<{ slug?: string[] }>;
    searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
    const { slug } = await params;

    // Handle /category/[name]
    if (slug && slug[0] === "category" && slug[1]) {
        const category = getCategoryFromSlug(slug[1]);
        if (!category) return {};
        return {
            title: `Best ${category} Affiliate Programs — AffiliateBase`,
            description: `Explore the best curated ${category} affiliate programs. Discover top-tier SaaS tools and recurring revenue opportunities.`,
            alternates: {
                canonical: `/category/${slug[1]}`,
            }
        };
    }

    // Default Home
    return {
        title: "AffiliateBase — Curated SaaS Affiliate Programs",
        description: "A curated directory of software affiliate programs. Discover high-paying SaaS tools and recurring revenue opportunities for creators and marketers.",
    };
}

export async function generateStaticParams() {
    const paths: { slug: string[] }[] = [
        { slug: [] }, // Root
    ];

    Object.values(CATEGORY_SLUGS).forEach((slug) => {
        paths.push({ slug: ["category", slug] });
    });

    return paths;
}

export default async function UniversalHome({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { category: legacyCategory } = await searchParams;

    // 1. Handle Legacy Redirects (?category=Name)
    if (legacyCategory) {
        const categorySlug = getSlugFromCategory(legacyCategory as Category);
        if (categorySlug) {
            redirect(`/category/${categorySlug}`);
        }
    }

    let activeCategory: string | null = null;

    // 2. Parse Category from path [[...slug]]
    if (slug && slug[0] === "category" && slug[1]) {
        activeCategory = getCategoryFromSlug(slug[1]);
        if (!activeCategory) {
            notFound();
        }
    } else if (slug && slug.length > 0) {
        // Fallback for other paths that reached this catch-all but aren't intended
        if (slug[0] !== "category") {
            if (slug[0] !== "") notFound();
        }
    }

    const [initialPrograms, activeCategories] = await Promise.all([
        getLeaderboardPrograms(activeCategory || undefined),
        getActiveCategories()
    ]);

    const serializedPrograms = JSON.parse(JSON.stringify(initialPrograms));

    return (
        <HomeContent
            initialPrograms={serializedPrograms}
            initialCategory={activeCategory as Category | null}
            activeCategories={activeCategories}
        />
    );
}
