// file: wordProcessor.js
import fs from 'fs';
import { existsSync } from 'fs'
import { createReadStream } from 'fs';

// Import JSON files using ES modules (Node 16+ supports import assertions)
import dictionary from '../wordData/dict.json' with { type: 'json' };
import generalWordFreq from '../wordData/wordFreq.json' with { type: 'json' };

import { getHashValue, rows } from './hash.js';


const isNotSpecialWord = (word) => {
    const specialChars = [
        ".", ",", " ", "-", "`", "[", "\n", "\t", "]", "*", '"', ">", "<", ":", ";",
        "(", ")", "=", "!", "+", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "\"", "?",
    ];
    return !specialChars.some(char => word.includes(char));
};






async function readTxtFile(filePath) {
    return new Promise((resolve, reject) => {

        let wordCount = Array(0);
        for (let i = 0; i < dictionary.length; i++) {
            wordCount.push([])
            for (let j = 0; j < dictionary[i].length; j++) {
                wordCount[i].push(0)
            }
        }

        console.log("reading file...");

        let reader = createReadStream(filePath);

        console.log("Processing training data... \n")


        reader.on('data', (chunk) => {
            let string = chunk.toString().toLowerCase();
            let word = "";

            for (let i = 0; i < string.length; i++) {
                if (isNotSpecialWord(string[i])) {
                    word += string[i];
                } else {
                    let wordIndex = getHashValue(word);

                    for (let j = 0; j < dictionary[wordIndex].length; j++) {
                        if (dictionary[wordIndex][j] == word) {
                            if (wordCount[wordIndex][j] < 100) { // ignore too common words
                                wordCount[wordIndex][j] += 1;
                            }
                        }
                    }
                    word = "";
                }
            }
        });

        reader.on("end", () => {
            resolve(wordCount)
            console.log("read file ", filePath, "correctly")


        });

        reader.on("error", (err) => {
            console.error("Error reading file:", err);
            reject()
        });
    })

}


let text1 = await readTxtFile("./text1.txt")
let text2 = await readTxtFile("./text2.txt")

console.log("Text vs Text2", compare(text1, text2))


function compare(matrix1, matrix2) {
    let arr1 = (convertToArray(matrix1));
    let arr2 = (convertToArray(matrix2));
    // arr1 = normalise(arr1);
    // arr2 = normalise(arr2);
    let radian = 180 / Math.PI;
    console.log("angle:", (angleBetween(arr1, arr2) * radian).toPrecision(2) + "°")

    const distance = dist(arr1, arr2);
    console.log("distance:", distance.toPrecision(2))

    const rms = (dist(arr1, arr2) / Math.sqrt(arr1.length))
    console.log("rms: ", rms.toPrecision(2))

    wordEquality(arr1, arr2);

    fs.writeFile('compare.json', JSON.stringify(matrix1, matrix2), (err) => {
        if (err) throw err;
        console.log('Count data has been saved!');
    });

    return "\n";
}

function norm(a) {
    let acc = 0;
    for (let i = 0; i < a.length; i++) {
        acc += a[i] * a[i];
    }
    return Math.sqrt(acc);
}

function wordEquality(arr1, arr2) {

    let totalUniqueWords = 0;
    let sameWords = 0;

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] != 0 || arr2[i] != 0) {
            totalUniqueWords++
        }
        if (arr1[i] !== 0 && arr2[i] != 0) {
            sameWords++;
        }
    }

    console.log("totalwords", totalUniqueWords)
    console.log("sameWords", sameWords)
    console.log("percent:", ((sameWords / totalUniqueWords) * 100).toPrecision(4), "%")
}


function normalise(arr) {

    const n = norm(arr);

    const l = arr.length;

    return arr.map((val) => {
        return val / n;
    })
}

function RMS(a, b) {
    let arr = Array(a.length);

    for (let i = 0; i < arr.length; i++) {
        arr[i] = a[i] - b[i]
    }
    return norm(arr)

}

function dist(a, b) {
    let arr = Array(a.length);

    for (let i = 0; i < arr.length; i++) {
        arr[i] = a[i] - b[i]
    }
    return norm(arr)
}



function angleBetween(a, b) {
    return Math.acos(innerProduct(a, b) / (norm(a) * norm(b)))
}

function innerProduct(a, b) {
    if (a.length !== b.length) {
        console.log("arrays not the same length")
        return;
    }
    let acc = 0;
    for (let i = 0; i < a.length; i++) {

        acc += a[i] * b[i];
    }
    return acc;
}


function convertToArray(matrix) {
    let array = [];

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {

            array.push(matrix[i][j] / (Math.log(generalWordFreq[i][j]) || 1))
        }
    }
    return array
}




function displayWordsInText(array) {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            if (array[i][j] != "") {
                console.log(dictionary[i][j])
            }
        }
    }
}

function countTotalWords(array) {
    let totalwords = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < array[i].length; j++) {
            if (array[i][j]) {
                totalwords += array[i][j];
            }
        }
    }
    console.log("t words", totalwords);
}
