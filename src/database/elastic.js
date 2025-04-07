import { Client } from '@elastic/elasticsearch';
import fs from 'fs';

const client = new Client({
    node: 'https://localhost:9200',
    sniff: false,
    tls: {
        ca: fs.readFileSync('./http_ca.crt'),
        rejectUnauthorized: false
    },
    auth: {
        username: 'elastic',
        password: process.env.ELASTIC_PASSWORD
    }
});

export async function insertData(data) {
    const body = data.flatMap(doc => [{ index: { _index: 'companies' } }, doc]);

    try {
        const response = await client.bulk({ refresh: true, body });

        if (response.errors) {
            console.error('Errors in bulk insert', response);
        } else {
            console.log('Data successfully inserted into Elasticsearch!');
        }
    } catch (error) {
        console.error('Error inserting data:', error);
    }
}

export async function searchCompany(query) {
    try {
        const response = await client.search({
            index: 'companies',
            body: {
                query: {
                    bool: {
                        should: [
                            { match: { domain: query.website || '' } },
                            { match: { company_all_available_names: query.name || '' } },
                            { match: { phoneNumbers: query.phone || '' } },
                            { match: { socialLinks: query.facebook || '' } }
                        ]
                    }
                },
                "size": 1
            }
        });

        return response;

    } catch (error) {
        console.error("Search error:", error);
    }
}
