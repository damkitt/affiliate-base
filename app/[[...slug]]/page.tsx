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
            title: `Best ${category} Affiliate Programs (2026) — AffiliateBase`,
            description: `A curated list of the highest-paying ${category} affiliate programs. Compare commission rates, cookie durations, and terms for top SaaS tools in ${category}.`,
            alternates: {
                canonical: `/category/${slug[1]}`,
            }
        };
    }

    // Default Home
    return {
        title: "Affiliate Base: The #1 Affiliate Directory for Creators",
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://affiliatebase.co";

    // Base Brand Schemas
    const graph: any[] = [
        {
            "@type": "Organization",
            "@id": `${baseUrl}/#organization`,
            "name": "AffiliateBase",
            "url": baseUrl,
            "logo": `${baseUrl}/android-chrome-192x192.png`,
            "sameAs": [
                "https://x.com/affiliatebase_co"
            ]
        },
        {
            "@type": "WebSite",
            "@id": `${baseUrl}/#website`,
            "url": baseUrl,
            "name": "AffiliateBase",
            "publisher": { "@id": `${baseUrl}/#organization` },
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${baseUrl}/?search={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        }
    ];

    // Add CollectionPage schema for categories
    if (activeCategory) {
        graph.push({
            "@type": "CollectionPage",
            "@id": `${baseUrl}/category/${getSlugFromCategory(activeCategory as Category)}#webpage`,
            "url": `${baseUrl}/category/${getSlugFromCategory(activeCategory as Category)}`,
            "name": `Best ${activeCategory} Affiliate Programs`,
            "description": `A curated list of the top ${activeCategory} affiliate programs available in 2026.`,
            "isPartOf": { "@id": `${baseUrl}/#website` },
            "mainEntity": {
                "@type": "ItemList",
                "itemListElement": serializedPrograms.slice(0, 10).map((p: any, index: number) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "url": `${baseUrl}/programs/${p.slug || p.id}`
                }))
            }
        });
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": graph
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomeContent
                initialPrograms={serializedPrograms}
                initialCategory={activeCategory as Category | null}
                activeCategories={activeCategories}
            />
        </>
    );
}
