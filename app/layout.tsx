import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WhoopHero } from "@/components/WhoopHero";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
    subsets: ["latin"],
    weight: ["400"],
    style: ["normal", "italic"],
    variable: "--font-serif",
});

export const metadata: Metadata = {
    title: 'Affiliate Base - Verified Programs Directory',
    description: "The database of verified affiliate programs",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} ${dmSerif.variable} min-h-screen relative`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <WhoopHero />
                    <main className="min-h-screen relative z-10">
                        {children}
                    </main>
                </ThemeProvider>
            </body>
        </html>
    );
}
