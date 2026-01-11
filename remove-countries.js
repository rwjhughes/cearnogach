const fs = require('fs');
const path = require('path');

// Read countries.json
const countriesPath = path.join(__dirname, 'countries.json');
const countries = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));

// Read word-list.json
const wordListPath = path.join(__dirname, 'word-list.json');
const wordList = JSON.parse(fs.readFileSync(wordListPath, 'utf8'));

/**
 * Extract all words from country names (ga and en fields)
 * Split multi-word names into individual words and normalize
 */
function extractCountryWords() {
    const countryWords = new Set();

    countries.forEach(country => {
        // Process 'ga' field
        if (country.ga) {
            const gaWords = country.ga.toLowerCase().split(/\s+/);
            gaWords.forEach(word => {
                const cleaned = word.trim().replace(/[^\wáéíóú]/g, '');
                if (cleaned.length > 0) {
                    countryWords.add(cleaned);
                }
            });
        }

        // Process 'en' field
        if (country.en) {
            const enWords = country.en.toLowerCase().split(/\s+/);
            enWords.forEach(word => {
                const cleaned = word.trim().replace(/[^\w]/g, '');
                if (cleaned.length > 0) {
                    countryWords.add(cleaned);
                }
            });
        }
    });

    return countryWords;
}

/**
 * Remove country words from word list
 */
function removeCountryWords() {
    const countryWords = extractCountryWords();
    console.log(`Found ${countryWords.size} unique country words to remove`);
    console.log('Sample country words:', Array.from(countryWords).slice(0, 20).join(', '));

    const originalLength = wordList.length;

    // Filter out words that match country words (case-insensitive)
    const filteredWordList = wordList.filter(word => {
        const normalized = word.toLowerCase().trim();
        return !countryWords.has(normalized);
    });

    const removedCount = originalLength - filteredWordList.length;
    console.log(`\nOriginal word count: ${originalLength}`);
    console.log(`Removed ${removedCount} words`);
    console.log(`New word count: ${filteredWordList.length}`);

    // Show some examples of removed words
    const removedWords = wordList.filter(word => {
        const normalized = word.toLowerCase().trim();
        return countryWords.has(normalized);
    });

    if (removedWords.length > 0) {
        console.log('\nExamples of removed words:');
        removedWords.slice(0, 20).forEach(word => {
            console.log(`  - ${word}`);
        });
    }

    return filteredWordList;
}

// Process and write
const filteredWordList = removeCountryWords();

// Write to file (overwrite original)
fs.writeFileSync(wordListPath, JSON.stringify(filteredWordList, null, 2), 'utf8');

console.log(`\nFiltered word list written to: ${wordListPath}`);
