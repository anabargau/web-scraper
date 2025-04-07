import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const puppeteerScrape = async (url) => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setRequestInterception(true);

        page.on('request', (request) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

        const proxyUrl = `${process.env.SCRAPER_API_URL}?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;

        await page.goto(proxyUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });

        const data = await page.evaluate(() => {
            const result = {
                phoneNumbers: [],
                socialLinks: []
            };

            const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3}[-.\s]?\d{3,4}/g;
            const socialRegex = /facebook|linkedin|twitter|instagram/;

            const textContent = document.body.innerText;

            result.phoneNumbers = textContent.match(phoneRegex) || [];
            result.phoneNumbers = result.phoneNumbers.map(num => num.trim());

            document.querySelectorAll('a').forEach(a => {
                const href = a.href;
                if (href && socialRegex.test(href)) {
                    result.socialLinks.push(href);
                }
            });

            return result;
        });

        await browser.close();
        return data;
    } catch (e) {
        console.error(`Error puppeteer scraping ${url}`, e.message);
        return null;
    }
}

export default puppeteerScrape;