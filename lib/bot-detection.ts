// Bot detection patterns - use word boundaries (\b) to avoid false positives
const BOT_PATTERNS = [
    // Search engine bots (explicit names)
    /googlebot/i, /bingbot/i, /yandexbot/i, /baiduspider/i, /duckduckbot/i,
    // Social media bots
    /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i, /slackbot/i, /discordbot/i,
    /whatsapp/i, /telegrambot/i, /pinterest/i, /redditbot/i,
    // SEO tools
    /ahrefs/i, /semrush/i, /moz\.com/i, /screaming frog/i, /majestic/i, /dotbot/i,
    // Headless browsers & testing tools
    /headless/i, /phantom/i, /puppeteer/i, /playwright/i, /selenium/i, /webdriver/i,
    /lighthouse/i, /pagespeed/i, /gtmetrix/i, /pingdom/i, /uptimerobot/i,
    // Preview bots
    /embedly/i, /quora link preview/i, /outbrain/i, /flipboard/i, /bitlybot/i,
    /skypeuripreview/i, /nuzzel/i,
    // CLI/script tools
    /^curl\//i, /^wget\//i, /python-requests/i, /go-http-client/i, /node-fetch/i,
    /^axios\//i, /httpie/i, /^okhttp/i, /java\//i,
    // Debug/test scripts
    /debugscript/i, /^test\//i,
    // Generic bot patterns (with word boundary)
    /\bbot\b/i, /\bcrawler\b/i, /\bspider\b/i, /\bscraper\b/i,
    // Apple/Google bots
    /applebot/i, /adsbot-google/i, /mediapartners-google/i,
];

export function isBot(ua: string | null): boolean {
    if (!ua) return false;
    return BOT_PATTERNS.some(pattern => pattern.test(ua));
}
