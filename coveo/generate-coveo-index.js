const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const languageIndex = args.indexOf('--language');
const language = languageIndex !== -1 ? args[languageIndex + 1] : 'en'; // Default language is 'en'

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
    fs.writeFileSync(fileName, xmlContent);
    console.log(`Coveo XML file '${fileName}' created successfully.`);
};

// Main function
const main = () => {
    const xmlContent = generateCoveoXml();
    writeCoveoXmlFile(xmlContent);
};

// Execute main function
main();
