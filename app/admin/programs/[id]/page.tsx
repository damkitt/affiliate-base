import { getProgramManagementData } from "@/app/admin/actions";
import ManageProgramClient from "./ManageProgramClient";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ManageProgramPage({ params }: PageProps) {
    const { id } = await params;
    const result = await getProgramManagementData(id, "7d");

    if (!result.success || !result.program) {
        notFound();
    }

    return (
        <ManageProgramClient
            initialProgram={result.program as any}
            initialStats={result.stats as any}
        />
    );
}
