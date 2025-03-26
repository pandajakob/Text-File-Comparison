
// file: wordProcessor.js
import fs from 'fs';
import { existsSync } from 'fs'
import { createReadStream } from 'fs';

// Import JSON files using ES modules (Node 16+ supports import assertions)
import dictionary from '../wordData/dict.json' with { type: 'json' };
import generalWordFreq from '../wordData/wordFreq.json' with { type: 'json' };

import { getHashValue, rows } from './hash.js';
import { arrayBuffer } from 'stream/consumers';

import nextWords from '../wordData/nextWords.json' with { type: 'json' };
import nextNextWords from '../wordData/nextNextWords.json' with { type: 'json' };

import { start } from 'repl';





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

                        let bucketIndex = getHashValue(word);


                        for (let j = 0; j < dictionary[bucketIndex].length; j++) {
                            if (dictionary[bucketIndex][j] == word) {
                                generalWordFreq[bucketIndex][j] += 1;
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

async function findNext(filePath) {
    return new Promise((resolve, reject) => {
        //console.log("reading file...");
        if (!existsSync(filePath)) {
            reject()
        }
        let reader = createReadStream(filePath);

        console.log("Processing training data at path", filePath)

        reader.on('data', (chunk) => {
            let string = chunk.toString().toLowerCase();
            let skip = false;

            let lastBucketIndex = null;
            let lastWordIndex = null;


            let lastLastBucketIndex = null;
            let lastLastWordIndex = null;

            let word = "";
            for (let i = 0; i < string.length; i++) {
                if (isNotSpecialWord(string[i])) {
                    word += string[i];
                } else {


                    let bucketIndex = getHashValue(word);
                    let wordIndex = findWord(word);

                    if (dictionary[bucketIndex][wordIndex] == word) {
                        if (lastLastBucketIndex !== null && lastLastWordIndex !== null) {
                            nextNextWords[lastLastBucketIndex][lastLastWordIndex].push(dictionary[bucketIndex][wordIndex]);
                        }

                        lastLastBucketIndex = lastBucketIndex;
                        lastLastWordIndex = lastWordIndex;
                        
                        lastBucketIndex = bucketIndex;
                        lastWordIndex = wordIndex;


                    } else {
                        lastBucketIndex = null;
                        lastWordIndex = null;
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

/*
for (let i = 1000; i < 3600; i ++) {
    let path = `./articles/data/${i}/text.json`
    if (existsSync(path)) {
        await findNext(path);

    }
}
*/
function findWord(word) {
    let hash = getHashValue(word);

    for (let i = 0; i < dictionary[hash].length; i++) {
        if (dictionary[hash][i] === word) {
            return i;
        }
    }
}
let string = "";

function makeSentence(startWord, depth) {
    if (depth == 0) {
        return
    }

    let hash = getHashValue(startWord)
    let bucket = findWord(startWord)

    let next = nextWords[hash][bucket];

    if (next[0]?.length > 0) {
        let nextWord = next[Math.floor(Math.random()*next.length)];
        let nextHash = getHashValue(nextWord);
        let nextBucket = findWord(nextWord);
        
        let nextNextWords1 = nextNextWords[nextHash][nextBucket]
        let nextNextWord = nextNextWords1[Math.floor(Math.random()*nextNextWords1.length)]

        string += `${nextWord} ${nextNextWord} `;
        makeSentence(nextNextWord, depth - 1)
    } else {
        console.log("no word after:", startWord )
        return
    }
}

let startWord = "i"
string += startWord + " ";

makeSentence(startWord, 100)

console.log(string)

//await countWords(`./articles/small/text3.txt`)


fs.writeFile('.//wordData/nextNextWords.json', JSON.stringify(nextNextWords), (err) => {
    if (err) throw err;
    console.log('Count data has been saved!');
});

