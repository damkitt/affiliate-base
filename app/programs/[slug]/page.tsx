import { getCachedProgramBySlug } from "@/lib/data-fetching";
import { ProgramDetailContent } from "@/components/ProgramDetail/ProgramDetailContent";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Revalidate every 60 seconds
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getCachedProgramBySlug(slug);
  if (!program) return {};

  // Build title dynamically based on available data
  const titleParts = [`${program.programName} Affiliate Program`];
  if (program.commissionRate && program.commissionRate > 0) {
    titleParts.push(`${program.commissionRate}% Commission & Details`);
  } else {
    titleParts.push("Details & Terms");
  }
  const title = titleParts.join(": ");

  // Build description dynamically
  let description = `Join the ${program.programName} affiliate program.`;
  if (program.commissionRate && program.commissionRate > 0) {
    description += ` Earn ${program.commissionRate}%.`;
  }
  if (program.cookieDuration && program.cookieDuration > 0) {
    description += ` Cookie duration: ${program.cookieDuration} days.`;
  }
  description += " View full program stats and payout terms.";

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
          url: `/programs/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${program.programName} Program Details`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/programs/${slug}/opengraph-image`],
    },
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

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: program.programName,
      description: program.description || program.tagline,
      applicationCategory: program.category || 'BusinessApplication',
      operatingSystem: 'All',
      image: program.logoUrl,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: `Commission: ${program.commissionRate}%`
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://affiliatebase.co'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: program.programName,
          item: `https://affiliatebase.co/programs/${slug}`
        }
      ]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <ProgramDetailContent program={serializedProgram} />
    </>
  );
}
