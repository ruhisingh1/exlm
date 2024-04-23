import fs from 'fs';
import ffetch from '../scripts/ffetch.js';
import { getLink, getPathDetails } from '../scripts/scripts.js';

const { lang } = getPathDetails();
const articles = await ffetch(`/${lang}/article-index.json`).all();
// eslint-disable-next-line no-console
console.log("articles js file");
// eslint-disable-next-line no-console
console.log(articles);

articles.forEach((article) => {
  // eslint-disable-next-line no-console
  console.log(`${getLink(article.path)}`);
  // eslint-disable-next-line no-console
  console.log(`${getLink(article.authorBioPage)}`);
});
// eslint-disable-next-line no-use-before-define
createCoveoFields(articles);
// eslint-disable-next-line no-use-before-define
writeCoveoXML(articles);

// async function fetchMetaTags(url) {
//   return new Promise((resolve, reject) => {
//     https
//       .get(url, (res) => {
//         let data = '';

//         res.on('data', (chunk) => {
//           data += chunk;
//         });

//         res.on('end', () => {
//           const $ = cheerio.load(data);
//           const metaTags = {};
//           $('meta').each((index, element) => {
//             const key = $(element).attr('name');
//             const value = $(element).attr('content');
//             if (key && value) {
//               metaTags[key] = value;
//             }
//           });
//           resolve(metaTags);
//         });
//       })
//       .on('error', (err) => {
//         console.error(`Error fetching meta tags from ${url}: ${err.message}`);
//         reject(err);
//       });
//   });
// }

function isNotEmpty(field) {
  return field && field !== '';
}
/ Function to decode base64 strings
function decodeBase64(encodedString) {
  return atob(encodedString);
}

// Function to decode and join encoded strings
function decodeAndJoin(encodedStrings) {
  // Split each encoded string and decode it
  const decodedStrings = encodedStrings.map((encodedString) => decodeBase64(encodedString.split("/")[1]));

  // Join the decoded strings with comma
  const joinedString = decodedStrings.join(", ");

  return joinedString;
}
async function createCoveoFields(index) {
  // eslint-disable-next-line no-console
  console.log('Processing data...');
  // eslint-disable-next-line no-restricted-syntax
  for (const item of index.data) {
    if (isNotEmpty(item.authorBioPage)) {
      try {
        // eslint-disable-next-line no-await-in-loop
       // const metaTags = await fetchMetaTags(`${getLink(item.authorBioPage)}`);
        // Update item with meta tags fetched from authorBioPage
       // Object.assign(item, metaTags);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Error fetching meta tags for ${item.authorBioPage}: ${err.message}`);
      }
    }

    const lastModified = new Date(0);
    lastModified.setUTCSeconds(isNotEmpty(item.date) ? item.date : item.lastModified);
    item.lastmod = lastModified.toISOString();

    item.path = isNotEmpty(item.path) ? `${getLink(item.path)}` : item.internal_path;
    item.role = decodeAndJoin(item.role?.item.role);
    item.solution = decodeAndJoin(item[`coveo-solution`]?.item[`coveo-solution`]);
    item.level = decodeAndJoin(item.level?.item.level);
    item.contenttype = item[`coveo-content-type`]?.item[`coveo-content-type`];
    item.authorType = item[`coveo-content-type`]?.item[`coveo-content-type`];
    item.authorName = item[`coveo-content-type`]?.item[`coveo-content-type`];
  }
}

async function writeCoveoXML(index) {
  index.data.sort((item1, item2) => item1.priority - item2.priority);
  const xmlData = [];
  xmlData.push(
    '<urlset xmlns="http://www.google.com/schemas/sitemap/0.84" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:coveo="http://www.coveo.com/schemas/metadata" xsi:schemaLocation="http://www.google.com/schemas/sitemap/0.84 http://www.google.com/schemas/sitemap/0.84/sitemap.xsd">',
  );
  let count = 0;

  index.data.forEach((item) => {
    xmlData.push('  <url>');
    xmlData.push(`    <loc>${item.path}</loc>`);
    xmlData.push(`    <lastmod>${item.lastmod}</lastmod>`);
    xmlData.push('    <changefreq>daily</changefreq>');
    xmlData.push('    <coveo:metadata>');
    xmlData.push(`      <coveo-content-type>${item.contenttype}</coveo-content-type>`);
    xmlData.push(`      <coveo-solution>${item.solution}</coveo-solution>`);
    xmlData.push(`      <role>${item.role}</role>`);
    xmlData.push(`      <level>${item.level}</level>`);
    xmlData.push(`      <author-type>${item.authorType}</author-type>`);
    xmlData.push(`      <author-name>${item.authorName}</author-name>`);
    xmlData.push('    </coveo:metadata>');

    xmlData.push('  </url>');

    count += 1;
  });

  xmlData.push('</urlset>');

  try {
    fs.writeFileSync('coveo.xml', xmlData.join('\n'));
    console.log(`Successfully wrote ${count} items to coveo xml`);
  } catch (err) {
    console.error(err);
  }
}
