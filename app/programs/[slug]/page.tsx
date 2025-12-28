import { getCachedProgramBySlug, getLeaderboardPrograms } from "@/lib/data-fetching";
import { ProgramDetailContent } from "@/components/ProgramDetail/ProgramDetailContent";
import { RelatedPrograms } from "@/components/ProgramDetail/RelatedPrograms";
import { Footer } from "@/components/Footer";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";

// Revalidate every 60 seconds
export const revalidate = 60;

// Pre-render the top 50 programs at build time
export async function generateStaticParams() {
  try {
    const programs = await getLeaderboardPrograms();
    return programs
      .filter((p) => p.slug) // Defensive: Ensure slug exists
      .map((p) => ({
        slug: p.slug!,
      }));
  } catch (error) {
    console.error("[generateStaticParams] Build-time error:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getCachedProgramBySlug(slug);
  if (!program) return {};

  // New Template
  // Title: ${program.name} Affiliate Program Details
  // Description: View commission rates, cookie duration, and payout terms for the ${program.name} affiliate program.
  const title = `${program.programName} Affiliate Program Details`;
  const description = `View commission rates, cookie duration, and payout terms for the ${program.programName} affiliate program.`;

  const canonicalUrl = `https://affiliatebase.co/programs/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Affiliate Base',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: `${canonicalUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${canonicalUrl}/opengraph-image`],
    },
    keywords: [
      `${program.programName} affiliate`,
      `${program.category} affiliate programs`,
      'best affiliate programs for creators',
      `${program.programName} affiliate program`,
      'high ticket affiliate programs',
    ],
  };
}

export default async function ProgramPage({ params }: PageProps) {
  const { slug } = await params;
  // Handle "fake-" slugs if they were used for testing, though in production we might not need this
  if (slug.startsWith("fake-")) {
    return notFound();
  }

  const program = await getCachedProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  // Serialize to ensure clean data passing to client component (dates to strings)
  const serializedProgram = JSON.parse(JSON.stringify(program));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://affiliatebase.co'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Programs',
            'item': 'https://affiliatebase.co'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': program.programName,
            'item': `https://affiliatebase.co/programs/${slug}`
          }
        ]
      },
      {
        '@type': 'SoftwareApplication',
        'name': program.programName,
        'description': program.description || program.tagline,
        'applicationCategory': program.category || 'BusinessApplication',
        'offers': {
          '@type': 'Offer',
          'name': 'Affiliate Commission',
          'description': `${program.commissionRate}% ${program.commissionDuration || ''}`,
          'priceCurrency': 'USD',
          'price': '0.00'
        },
        'brand': {
          '@type': 'Brand',
          'name': program.programName
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProgramDetailContent
        program={serializedProgram}
        relatedProgramsSlot={
          <Suspense fallback={<RelatedProgramsSkeleton />}>
            <RelatedPrograms category={program.category || "SaaS"} currentId={program.id} />
          </Suspense>
        }
      />
      <Footer />
    </>
  );
}

function RelatedProgramsSkeleton() {
  return (
    <div className="mt-24 border-t border-[var(--border)] pt-12 animate-pulse">
      <div className="flex justify-between mb-8">
        <div className="h-7 w-48 bg-[var(--bg-secondary)] rounded-lg"></div>
        <div className="h-5 w-20 bg-[var(--bg-secondary)] rounded-lg"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)]"></div>
        ))}
      </div>
    </div>
  );
}
