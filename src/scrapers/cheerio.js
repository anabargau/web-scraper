import axios from 'axios';
import * as cheerio from 'cheerio';

const cheerioScrape = async (url) => {
    try {
        let response = await axios.get(`${process.env.SCRAPER_API_URL}?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
            }
        });

        let $ = cheerio.load(response.data);

        let text = $('body').text();
        text.replace(/\s+/g, ' ');

        let phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3}[-.\s]?\d{3,4}/g;
        let phoneNumbers = text.match(phoneRegex) || [];

        phoneNumbers = phoneNumbers.map(num => num.trim());

        let socialLinks = [];
        $('a').each((_, el) => {
            let href = $(el).attr("href");
            if (href && /facebook|linkedin|twitter|instagram/.test(href)) {
                socialLinks.push(href);
            }
        });

        return {
            phoneNumbers,
            socialLinks
        };
    } catch (e) {
        console.error(`Error cheerio scraping ${url}`, e.message);
        return null;
    }
}

export default cheerioScrape;

