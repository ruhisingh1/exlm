const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
// eslint-disable-next-line no-console
console.log('Command line arguments:', args); // Debugging statement
const languageIndex = args.indexOf('--language');
// eslint-disable-next-line no-console
console.log('Language index:', languageIndex); // Debugging statement
const language = languageIndex !== -1 ? args[languageIndex + 1] : 'en'; // Default language is 'en'
// eslint-disable-next-line no-console
console.log('Selected language:', language); // Debugging statement

// Generate Coveo XML content based on language
const generateCoveoXml = () => {
    // Generate XML content based on language
    const xmlContent = `
        <CoveoIndex>
            <Language>${language}</Language>
            <!-- Add more elements as needed -->
        </CoveoIndex>
    `;
    return xmlContent;
};

// Write Coveo XML file
const writeCoveoXmlFile = (xmlContent) => {
    const fileName = `coveo_${language}.xml`;
    // eslint-disable-next-line no-console
    console.log('Writing to file:', fileName); // Debugging statement
    fs.writeFileSync(fileName, xmlContent);
    // eslint-disable-next-line no-console
    console.log(`Coveo XML file '${fileName}' created successfully.`);
};

// Main function
const main = () => {
    const xmlContent = generateCoveoXml();
    writeCoveoXmlFile(xmlContent);
};

// Execute main function
main();