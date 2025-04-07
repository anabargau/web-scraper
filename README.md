## 1. Presentation
This project is a distributed web scraping and company data retrieval system with the purpose of extracting meaningful business insights at scale. The goal was to create a robust and performant pipeline that could scrape hundreds of websites, extract relevant company data (such as names, domains, phone numbers, and social media links), and store them in a searchable format via ElasticSearch.

## 2. The Thinking Process
I started by trying to define the problem and the requirements necessary for this project to run smoothly: I needed accurate, large-scale, and resilient web scraping, and a search system that supports fuzzy and partial matching across multiple fields. I also knew I needed flexibility, performance under time constraints, and protection against any IP bans I may receive.

## 3.1 Cheerio vs Puppeteer
Since there was a time constraint to scraping quite a big number of sites, I needed to find an efficient way to do it. And since I couldn't find a single tool to fulfill al my requirements, I thought that a better approach was to use a combination of two and use the advantages of both in my favor. I ended up using Cheerio for static, faster parsing of HTML. This allowed me to scrape both complex and simple pages efficiently. And for sites that require rendering or JavaScript interaction, I decided to go with Puppeteer. Puppeteer scraping was only required when the Cheerio scrape failed to return all the data I needed, thus limiting the need to use Puppeteer, which is more time consuming.
I have made sure to check robots.txt and respect it, considering it the best approach ethically and legally.

## 3.2 Concurrency with PQueue
To scrape as many sites as possible in as little time as possible, I used PQueue with careful tuning of concurrency (based on system memory) to prevent overloads.

## 4. Scalable Search with ElasticSearch
What I needed from my form of data storage was to provide multi-field search (name, domain, phone, social links), fuzzy matching and partial matches and weighted scoring for better relevance. This lead me to choosing ElasticSearch, since it was the most accessible option that fulfilled all my needs.

## 5. Issues encountered
After everything was set in place and tried scraping the websites, I noticed that it failed, because multiple sites blocked my IP. That is when I decided I need to integrate the Puppeteer stealth plugin and Scraper API. Scraper API helped me to rotate IPs and avoid rate limits.

## 6. Limitations of the Project & Implementation

### Scraping Reliability & Fragility

Structure Variability: Websites don’t follow a standard structure. One change in the DOM can break the scraper, requiring constant maintenance or more robust scraping logic (like machine learning or pattern matching).
Timeouts & Frame Detachment: Even with retries and error handling, some pages may fail due to slow loading, navigation timeout, or unexpected redirects.

### Rate Limiting & IP Bans
Although I used ScraperAPI and rotation strategies, services can still rate-limit or block scraping based on traffic patterns or fingerprinting.
Proxies or scraping APIs often come with usage caps or costs that scale with volume.

### Data Quality & Noise
I may accidentally scrape irrelevant or malformed data (e.g., timestamps mistaken for phone numbers, placeholder content).
A specific problem was finding phone numbers, because they were mistakenly confused with timestamps or even user IDs. I tried to find a Regex that would help prevent this problem, but findind a Regex that would accomodate all the large number of phone number formats was difficult ant it still may not match all the phone numbers in the page. I think that a more complex phone number validator will be required to further improve the project.

### Scalability Bottlenecks
Even with PQueue, concurrency is still limited by machine resources (CPU, RAM). Horizontal scaling (distribution across multiple servers or containers) isn’t built-in yet. Memory issues if too many Puppeteer instances are open or too much data is held in memory.

## 7. Conclusion
This project ended up being a really fun (and sometimes frustrating!) mix of web scraping, data wrangling, and search logic. Of course, there were some bumps like sites blocking my IP or weird data sneaking in where phone numbers should’ve been. But I learned a ton about what works, what doesn’t, and where I could take this next. There’s still a lot of room to grow, like smarter data cleaning, better scaling, and more advanced scraping logic—but overall, this was a great first step toward building a scalable, ethical, and effective data scraping system.




