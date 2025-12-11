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

  return {
    title: `${program.programName} Affiliate Program Review | Affiliate Base`,
    description: program.tagline || `Learn about the ${program.programName} affiliate program commissions, cookie duration, and more.`,
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

  return <ProgramDetailContent program={serializedProgram} />;
}
