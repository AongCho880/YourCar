import { config } from 'dotenv';
// Ensure .env.local is prioritized by loading it specifically
// if it exists, otherwise .env will be loaded by default.
// The `override: true` option ensures that if GOOGLE_AI_KEY
// is in both .env and .env.local, the .env.local one takes precedence.
config({ path: '.env.local', override: true });
config(); // Load .env if .env.local not found or for other variables

import '@/ai/flows/generate-ad-copy.ts';
