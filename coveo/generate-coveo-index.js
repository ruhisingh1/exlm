import fs from 'fs';
import process from 'process';

// Parse command line arguments
const args = process.argv.slice(2);
console.log('Command line arguments:', args);
const languageIndex = args.indexOf('--language');
console.log('Language index:', languageIndex);
const language = languageIndex !== -1 ? args[languageIndex + 1] : 'en';
console.log('Selected language:', language);

// Fetch articles
const fetchedArticles = await fetch(`https://main--franklin-exlm--ruhisingh1.hlx.page/${language}/article-index.json`);
console.log('Fetched articles:', fetchedArticles);

// Function to decode base64 strings
function decodeBase64(encodedString) {
    return Buffer.from(encodedString, 'base64').toString('utf-8');
}

// Process articles and generate XML content
function generateXmlContent(articles) {
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
}

// Write Coveo XML file
function writeCoveoXML(xmlContent) {
    const fileName = `coveo_${language}.xml`;
    console.log('Writing to file:', fileName);
    try {
        fs.writeFileSync(fileName, xmlContent);
        console.log(`Coveo XML file '${fileName}' created successfully.`);
    } catch (error) {
        console.error('Error writing file:', error);
    }
}

// Main function
async function main() {
    try {
        const xmlContent = generateXmlContent(fetchedArticles);
        writeCoveoXML(xmlContent);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Execute main function
main();
