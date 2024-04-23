import fs from 'fs';
import http from 'http'; // Changed from require('http')
import process from 'process';

// Parse command line arguments
const args = process.argv.slice(2);
const languageIndex = args.indexOf('--language');
const language = languageIndex !== -1 ? args[languageIndex + 1] : 'en';

// Fetch articles
async function fetchDataFromURL(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (response) => {
            let data = '';

            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            response.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Example usage:
const url = `https://main--franklin-exlm--ruhisingh1.hlx.page/${language}/article-index.json`;
fetchDataFromURL(url)
    .then(data => {
        console.log('Data:', data);
    })
    .catch(err => {
        console.error('Error:', err);
    });

// Function to decode base64 strings
function decodeBase64(encodedString) {
    return Buffer.from(encodedString, 'base64').toString('utf-8');
}

// Process articles and generate XML content
async function generateXmlContent() {
    try {
        // Call fetchDataFromURL instead of fetchArticles
        const articles = await fetchDataFromURL(url); // Assuming url is defined in the global scope
        console.log(articles);
        const xmlData = [];

        articles.forEach((article) => {
            xmlData.push('<url>');
            xmlData.push(`  <loc>${article.path}</loc>`);
            xmlData.push(`  <lastmod>${article.lastmod}</lastmod>`);
            xmlData.push('  <changefreq>daily</changefreq>');
            xmlData.push('  <coveo:metadata>');
            xmlData.push(`    <coveo-content-type>${article.contenttype}</coveo-content-type>`);
            xmlData.push(`    <coveo-solution>${decodeBase64(article.solution)}</coveo-solution>`);
            xmlData.push(`    <role>${decodeBase64(article.role)}</role>`);
            xmlData.push(`    <level>${decodeBase64(article.level)}</level>`);
            xmlData.push(`    <author-type>${article.authorType}</author-type>`);
            xmlData.push(`    <author-name>${article.authorName}</author-name>`);
            xmlData.push('  </coveo:metadata>');
            xmlData.push('</url>');
        });

        return `
            <urlset xmlns="http://www.google.com/schemas/sitemap/0.84"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xmlns:coveo="http://www.coveo.com/schemas/metadata"
                    xsi:schemaLocation="http://www.google.com/schemas/sitemap/0.84 http://www.google.com/schemas/sitemap/0.84/sitemap.xsd">
                ${xmlData.join('\n')}
            </urlset>
        `;
    } catch (error) {
        console.error('Error generating XML content:', error);
        throw error;
    }
}

// Write Coveo XML file
async function writeCoveoXML() {
    try {
        const xmlContent = await generateXmlContent();
        const fileName = `coveo_${language}.xml`;
        console.log('Writing to file:', fileName);
        fs.writeFileSync(fileName, xmlContent);
        console.log(`Coveo XML file '${fileName}' created successfully.`);
    } catch (error) {
        console.error('Error writing Coveo XML file:', error);
        throw error;
    }
}

// Main function
async function main() {
    try {
        await writeCoveoXML();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Execute main function
main();
