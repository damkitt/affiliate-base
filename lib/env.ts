import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(1),
    CRON_SECRET: z.string().min(1),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

/**
 * Validates that all required environment variables are set.
 * During build time, it logs warnings. During runtime, it throws.
 */
export function validateEnv() {
    const result = envSchema.safeParse(process.env);
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production';

    if (!result.success) {
        const missingVars = result.error.issues.map(i => i.path.join('.')).join(', ');
        console.warn(`⚠️  Missing or invalid environment variables: ${missingVars}`);

        // During actual production runtime, we want to fail fast.
        // However, during the 'next build' phase, secrets like CRON_SECRET 
        // might not be present, so we only throw if we are SURE we are running.
        if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE?.includes('build')) {
            throw new Error(`Critical environment variables missing: ${missingVars}. Please check your deployment settings.`);
        }
    }

    return result.data;
}

// Auto-validate on import to catch errors as early as possible
export const env = validateEnv();
