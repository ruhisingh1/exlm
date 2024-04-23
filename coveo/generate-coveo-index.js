import fs from 'fs';
import process from 'process';
// eslint-disable-next-line import/no-extraneous-dependencies
import fetch from 'node-fetch'; 

// Parse command line arguments
const args = process.argv.slice(2);
const languageIndex = args.indexOf('--language');
const language = languageIndex !== -1 ? args[languageIndex + 1] : 'en';

// Fetch articles
async function fetchArticles() {
    try {
        const response = await fetch(`https://main--franklin-exlm--ruhisingh1.hlx.page/${language}/article-index.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching articles:', error);
        throw error;
    }
}
// Function to decode base64 strings
function decodeBase64(encodedString) {
  return Buffer.from(encodedString, 'base64').toString('utf-8');
}
// Process articles and generate XML content
async function generateXmlContent() {
    try {
        const articles = await fetchArticles();
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
