import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add Program | Affiliate Base",
    description: "Submit your SaaS or Tech affiliate program to the Affiliate Base database and get discovered by thousands of partners.",
};

export default function SubmitLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
