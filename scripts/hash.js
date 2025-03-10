export const rows = 50000;


export function getHashValue(word) {
    let hash = 5381; // Starting seed for djb2
    for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) + hash) + word.charCodeAt(i); // hash * 33 + c
    }
    // Ensure a non-negative result and limit by rows
    return Math.abs(hash % rows);
}

