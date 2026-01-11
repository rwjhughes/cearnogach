const fs = require('fs');
const path = require('path');

// Read lemmas.json
const lemmasPath = path.join(__dirname, 'lemmas.json');
console.log('Reading lemmas.json...');
const lemmas = JSON.parse(fs.readFileSync(lemmasPath, 'utf8'));

// Read word-list.json
const wordListPath = path.join(__dirname, 'word-list.json');
console.log('Reading word-list.json...');
const wordList = JSON.parse(fs.readFileSync(wordListPath, 'utf8'));

console.log(`Loaded ${Object.keys(lemmas).length} lemmas and ${wordList.length} words`);

/**
 * Build a reverse index: word -> lemma(s)
 * This maps each word form to the lemma(s) it belongs to
 */
function buildWordToLemmaIndex() {
    console.log('Building word-to-lemma index...');
    const wordToLemma = new Map();

    // Iterate through all lemmas
    for (const [lemma, wordForms] of Object.entries(lemmas)) {
        // The lemma itself is also a word form
        const normalizedLemma = lemma.toLowerCase().trim();
        if (!wordToLemma.has(normalizedLemma)) {
            wordToLemma.set(normalizedLemma, []);
        }
        wordToLemma.get(normalizedLemma).push(lemma);

        // Add all word forms from the lemma's array
        if (Array.isArray(wordForms)) {
            for (const wordForm of wordForms) {
                const normalized = wordForm.toLowerCase().trim();
                if (!wordToLemma.has(normalized)) {
                    wordToLemma.set(normalized, []);
                }
                wordToLemma.get(normalized).push(lemma);
            }
        }
    }

    console.log(`Index built: ${wordToLemma.size} unique word forms mapped`);
    return wordToLemma;
}

/**
 * Create word-lemma collection
 * For each word in word-list, find its lemma
 */
function createWordLemmaCollection() {
    const wordToLemma = buildWordToLemmaIndex();
    const wordCollection = {};
    let matchedCount = 0;
    let unmatchedCount = 0;
    const unmatchedWords = [];

    console.log('\nCreating word-lemma collection...');

    for (const word of wordList) {
        const normalized = word.toLowerCase().trim();
        const lemmas = wordToLemma.get(normalized);

        if (lemmas && lemmas.length > 0) {
            // If word appears in multiple lemmas, use the first one
            // (or we could use the lemma that matches the word exactly if it exists)
            let selectedLemma = lemmas[0];

            // Prefer the lemma that exactly matches the word (case-insensitive)
            const exactMatch = lemmas.find(l => l.toLowerCase() === normalized);
            if (exactMatch) {
                selectedLemma = exactMatch;
            }

            wordCollection[word] = selectedLemma;
            matchedCount++;
        } else {
            // Word not found in lemmas - this shouldn't happen if word-list came from lemmas
            // but we'll track it
            unmatchedWords.push(word);
            unmatchedCount++;
        }
    }

    console.log(`\nMatched: ${matchedCount} words`);
    console.log(`Unmatched: ${unmatchedCount} words`);

    if (unmatchedWords.length > 0 && unmatchedWords.length <= 20) {
        console.log('\nUnmatched words (first 20):');
        unmatchedWords.slice(0, 20).forEach(w => console.log(`  - ${w}`));
    } else if (unmatchedWords.length > 20) {
        console.log('\nUnmatched words (first 20):');
        unmatchedWords.slice(0, 20).forEach(w => console.log(`  - ${w}`));
        console.log(`  ... and ${unmatchedWords.length - 20} more`);
    }

    return wordCollection;
}

// Create the collection
const wordCollection = createWordLemmaCollection();

// Write to file
const outputPath = path.join(__dirname, 'word-collection.json');
console.log(`\nWriting to ${outputPath}...`);
fs.writeFileSync(outputPath, JSON.stringify(wordCollection, null, 2), 'utf8');

console.log(`\nDone! Created word-collection.json with ${Object.keys(wordCollection).length} word-lemma pairs.`);

// Show some examples
console.log('\nExamples:');
const examples = Object.entries(wordCollection).slice(0, 10);
examples.forEach(([word, lemma]) => {
    console.log(`  "${word}" -> "${lemma}"`);
});
