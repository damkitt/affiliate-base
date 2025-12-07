import { AdvertiseFlow } from "@/components/AdvertiseFlow";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AdvertisePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[var(--bg-background)]">
                <div className="w-full max-w-4xl">
                    <AdvertiseFlow />
                </div>
            </main>

            <Footer />
        </div>
    );
}
