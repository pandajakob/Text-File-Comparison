
// file: wordProcessor.js
import fs from 'fs';
import { existsSync } from 'fs'
import { createReadStream } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Import JSON files using ES modules (Node 16+ supports import assertions)
import dictionary from './dict.json' with { type: 'json' };
const frequentWords = (await fs.promises.readFile('./frequentWords.txt', 'utf-8')).split("\n");
import generalWordFreq from './wordFreq.json' with { type: 'json' };


// const path = require("path");
// const { pathToFileURL } = require("url");
const rows = 50000


function getHashValue(word) {
    let hash = 5381; // Starting seed for djb2
    for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) + hash) + word.charCodeAt(i); // hash * 33 + c
    }
    // Ensure a non-negative result and limit by rows
    return Math.abs(hash % rows);
}
const isNotSpecialWord = (word) => {
    const specialChars = [
        ".", ",", " ", "-", "`", "[", "\n", "\t", "]", "*", '"', ">", "<", ":", ";",
        "(", ")", "=", "!", "+", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "\"", "?",
    ];
    return !specialChars.some(char => word.includes(char));
};


async function countWords(filePath) {
    return new Promise((resolve, reject) => {
        //console.log("reading file...");
        if (!existsSync(filePath)) {
            reject()
        }
        let reader = createReadStream(filePath);

        //console.log("Processing training data at path", filePath)

        reader.on('data', (chunk) => {

            let string = chunk.toString().toLowerCase();
            let word = "";
            for (let i = 0; i < string.length; i++) {
                if (isNotSpecialWord(string[i])) {
                    word += string[i];
                } else {

                    if (isNotSpecialWord(word) && word != "." && word != "," && word != "") {

                        let wordIndex = getHashValue(word);


                        for (let j = 0; j < dictionary[wordIndex].length; j++) {
                            if (dictionary[wordIndex][j] == word) {
                                generalWordFreq[wordIndex][j] += 1;
                            }
                        }


                    }
                    word = "";
                }
            }

        });

        reader.on("end", () => {
            //console.log("finished reading file")
            resolve();
        });

        reader.on("error", (err) => {
            console.error("Error reading file:", err);
            reject()
        });
    })

}


await countWords(`./articles/yelpReviews.txt`)
    



fs.writeFile('wordFreq.json', JSON.stringify(generalWordFreq), (err) => {
    if (err) throw err;
    console.log('Count data has been saved!');
});
