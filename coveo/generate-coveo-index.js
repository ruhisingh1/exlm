import fs from 'fs';
import https from 'https';
import process from 'process';

// Parse command line arguments
const args = process.argv.slice(2);
const languageIndex = args.indexOf('--language');
const language = languageIndex !== -1 ? args[languageIndex + 1] : 'en';

async function fetchDataFromURL(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
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
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

const url = `https://main--franklin-exlm--ruhisingh1.hlx.page/${language}/article-index.json`;

// Function to decode base64 strings
function decodeBase64(encodedString) {
  return Buffer.from(encodedString, 'base64').toString('utf-8');
}

// Process articles and generate XML content
async function generateXmlContent() {
  try {
    // Call fetchDataFromURL instead of fetchArticles
    const articles = await fetchDataFromURL(url);
    const xmlData = [];

    articles.data.forEach((article) => {
      // Access 'data' property of articles
      xmlData.push('<url>');
      xmlData.push(`  <loc>${article.path}</loc>`);
      xmlData.push(`  <lastmod>${article.lastModified}</lastmod>`); // Fix property name
      xmlData.push('  <changefreq>daily</changefreq>');
      xmlData.push('  <coveo:metadata>');
      xmlData.push(`    <coveo-content-type>${article.coveoContentType}</coveo-content-type>`);

      // Decode base64 strings and remove prefix from coveoSolution
      const solutions = article.coveoSolution.split(', ');
      solutions.forEach((solution) => {
        xmlData.push(`    <coveo-solution>${decodeBase64(solution.replace('exl:solution/', ''))}</coveo-solution>`);
      });

      // Remove prefix from coveoRole
      xmlData.push(`    <role>${decodeBase64(article.coveoRole.replace('exl:role/', ''))}</role>`); // Fix property name

      // Decode base64 string and remove prefix from coveoLevel
      xmlData.push(`    <level>${decodeBase64(article.coveoLevel.replace('exl:experience-level/', ''))}</level>`); // Fix property name

      // If there are other properties to include, add them here
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
    // eslint-disable-next-line no-console
    console.error('Error generating XML content:', error);
    throw error;
  }
}

// Write Coveo XML file
async function writeCoveoXML() {
  try {
    const xmlContent = await generateXmlContent();
    const fileName = `coveo_${language}.xml`;
    fs.writeFileSync(fileName, xmlContent);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error writing Coveo XML file:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await writeCoveoXML();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error:', error);
  }
}

main();
