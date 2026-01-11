const fs = require('fs');
const path = require('path');

// Read countries.json
const countriesPath = path.join(__dirname, 'countries.json');
const countries = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));

/**
 * Remove initial "an" if it exists
 */
function removeInitialAn(text) {
    const trimmed = text.trim();
    if (trimmed.toLowerCase().startsWith('an ')) {
        return trimmed.substring(3).trim();
    }
    return trimmed;
}

/**
 * Remove 'h' if it is the second letter in the 'ga' field
 */
function removeHFromSecondLetter(text) {
    if (text.length >= 2 && text[1].toLowerCase() === 'h') {
        // Remove the 'h' (second character)
        return text[0] + text.substring(2);
    }
    return text;
}

/**
 * Process countries
 */
function processCountries() {
    const processed = countries.map(country => {
        let gaText = country.ga;

        // Remove initial "an" if it exists
        gaText = removeInitialAn(gaText);

        // Remove 'h' if it is the second letter in the 'ga' field
        gaText = removeHFromSecondLetter(gaText);

        return {
            ...country,
            ga: gaText
        };
    });

    return processed;
}

// Process countries
const processedCountries = processCountries();

// Write to file (overwrite original)
const outputPath = path.join(__dirname, 'countries.json');
fs.writeFileSync(outputPath, JSON.stringify(processedCountries, null, 2), 'utf8');

console.log(`Processed ${processedCountries.length} countries`);
console.log(`Output written to: ${outputPath}`);

// Show some examples
console.log('\nExamples:');
const examples = processedCountries.slice(0, 10);
examples.forEach(country => {
    console.log(`  ${country.code}: "${country.ga}"`);
});
