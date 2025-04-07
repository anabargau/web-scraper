import dotenv from 'dotenv';
import express from 'express';
import { searchCompany } from './database/elastic.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

app.get('/search', async (req, res) => {
    let query = req.query;

    if (Object.keys(query).length === 0) {
        return res.status(400).json({ message: 'No query parameters provided' });
    }

    let response = await searchCompany(query);

    if (response && response.hits.hits.length > 0) {
        return res.json(response.hits.hits);
    } else {
        return res.status(404).json({ message: 'No results found' });
    }
});
