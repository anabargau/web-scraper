import csv from 'csv-parser';
import fs from 'fs';
import os from 'os';
import PQueue from 'p-queue';
import robotsParser from 'robots-parser';
import { insertData } from '../database/elastic.js';
import cheerioScrape from './cheerio.js';
import puppeteerScrape from './puppeteer.js';

let totalUrls = 0;
let successfullyScrapedUrls = 0;

const getOptimalConcurrency = () => {
    const freeMemory = os.freemem() / 1e9;
    if (freeMemory > 4) return 20; // If more than 4GB free, run 20 parallel tasks
    if (freeMemory > 2) return 10; // If 2-4GB free, run 10 parallel tasks
    return 5;  // If less than 2GB free, keep it at 5 to prevent overload
};

const queue = new PQueue({ concurrency: getOptimalConcurrency() });

async function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        let sitesData = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                if (row.domain) sitesData.push({
                    domain: row.domain,
                    company_commercial_name: row.company_commercial_name,
                    company_legal_name: row.company_legal_name,
                    company_all_available_names: row.company_all_available_names
                });
            })
            .on('end', () => resolve(sitesData))
            .on('error', reject);
    });
}

const fixUrl = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }
    return url;
};

const isUrlAllowed = (url, userAgent = '*') => {
    const robotsUrl = `${url}/robots.txt`;
    const parser = robotsParser(robotsUrl, userAgent);
    return parser.isAllowed(url, userAgent);
}

async function scrapeWebsite(data) {
    let scrapedData = {};
    let url = fixUrl(data.domain);

    if (!isUrlAllowed(url)) {
        return null;
    }

    scrapedData = await cheerioScrape(url);

    if (!scrapedData || scrapedData.phoneNumbers.length === 0 || scrapedData.socialLinks.length === 0) {
        scrapedData = await puppeteerScrape(url);
    }

    if (!scrapedData) {
        console.error('Failed to scrape:', url);
    }

    data = {
        ...data,
        ...scrapedData
    };

    successfullyScrapedUrls++;
    console.log(`Successfully scraped ${successfullyScrapedUrls} urls`);
    return data;
}

const getWebsitesData = async () => {
    let sitesData = await readCSV('data/sample-websites-company-names.csv');

    totalUrls = sitesData.length;

    let fullData = [];

    const scrapePromises = sitesData.map(data => 
        queue.add(() => scrapeWebsite(data))
    );

    const responses = await Promise.all(scrapePromises);

    responses.forEach((response) => {
        if (response) {
            fullData.push(response);
        }
    });

    if (fullData.length > 0) {
        insertData(fullData);
    }

    console.log(`Scraped ${successfullyScrapedUrls} out of ${totalUrls} websites.`);
}

getWebsitesData();