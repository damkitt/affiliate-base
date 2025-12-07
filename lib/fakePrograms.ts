import { Program, Category } from "@/types";
import { CATEGORIES } from "@/constants";

const FAKE_PROGRAM_NAMES = [
    "CloudScale", "DevTool Pro", "SaaS Master", "CryptoFlow", "FinTech One",
    "HealthBoost", "EcoGreen", "EduLearn", "TravelWise", "FoodieBox",
    "FitLife", "GameZone", "MusicStream", "ArtGallery", "PhotoEdit",
    "VideoMaker", "SocialConnect", "MarketingHub", "SalesForce Plus", "HR Mate",
    "LegalEase", "RealEstate Pro", "AutoDrive", "PetCare", "HomeDecor",
    "FashionTrend", "BeautyGlow", "TechGadget", "MobileApp", "WebBuilder"
];

const TAGLINES = [
    "The best solution for your business",
    "Scale your operations with ease",
    "Unlock your potential today",
    "Join the revolution in tech",
    "Empowering creators worldwide",
    "Simple, fast, and reliable",
    "Your partner in success",
    "Innovating for a better future",
    "Connect with your audience",
    "Maximize your revenue now"
];

const DESCRIPTIONS = [
    "A comprehensive platform designed to help you grow your business and reach new heights. Join thousands of satisfied customers.",
    "Experience the difference with our cutting-edge technology and dedicated support team. We are here to help you succeed.",
    "Our tool provides everything you need to manage your workflow efficiently and effectively. Try it risk-free today.",
    "Discover the power of automation and streamline your processes. Save time and money with our innovative solutions.",
    "Build better relationships with your customers and increase your sales. Our platform is designed for growth."
];

// Deterministic selection based on index to avoid hydration mismatch
function getElementByIndex<T>(arr: readonly T[], index: number): T {
    return arr[index % arr.length];
}

function getSeededInt(seed: number, min: number, max: number): number {
    // Simple deterministic "random" based on seed
    const x = Math.sin(seed * 9999) * 10000;
    const normalized = x - Math.floor(x);
    return Math.floor(normalized * (max - min + 1)) + min;
}

// Fixed base date to ensure consistent results between server and client
const BASE_DATE = new Date("2025-01-01T00:00:00.000Z");

export function generateFakePrograms(count: number): Program[] {
    return Array.from({ length: count }).map((_, i) => {
        const id = `fake-${i + 1}`;
        const programName = FAKE_PROGRAM_NAMES[i % FAKE_PROGRAM_NAMES.length] || `Program ${i + 1}`;
        const category = getElementByIndex(CATEGORIES, i) as Category;

        return {
            id,
            programName,
            tagline: getElementByIndex(TAGLINES, i),
            description: getElementByIndex(DESCRIPTIONS, i),
            category,
            websiteUrl: `https://example.com/${id}`,
            affiliateUrl: `https://example.com/affiliate/${id}`,
            country: "US",
            commissionRate: getSeededInt(i, 10, 50),
            clicksCount: 0,
            approvalStatus: true,
            createdAt: new Date(BASE_DATE.getTime() - (i * 86400000)), // Each program 1 day apart
            updatedAt: BASE_DATE,
            logoUrl: null, // Will use fallback
        };
    });
}

export function getFakeProgram(id: string): Program | null {
    if (!id.startsWith("fake-")) return null;

    // Extract index from id "fake-1" -> 1
    const indexStr = id.replace("fake-", "");
    const index = parseInt(indexStr, 10);

    if (isNaN(index)) return null;

    // Use index to select deterministic data
    const programName = FAKE_PROGRAM_NAMES[(index - 1) % FAKE_PROGRAM_NAMES.length] || `Program ${index}`;
    const category = CATEGORIES[(index - 1) % CATEGORIES.length] as Category;

    return {
        id,
        programName,
        tagline: TAGLINES[(index - 1) % TAGLINES.length],
        description: DESCRIPTIONS[(index - 1) % DESCRIPTIONS.length],
        category,
        websiteUrl: `https://example.com/${id}`,
        affiliateUrl: `https://example.com/affiliate/${id}`,
        country: "US",
        commissionRate: 10 + ((index * 7) % 40), // Deterministic pseudo-random
        clicksCount: 0,
        approvalStatus: true,
        createdAt: new Date(Date.now() - 100000000 * index),
        updatedAt: new Date(),
        logoUrl: null,
    };
}
