# Compare two texts with this JavaScript program

## Description

This program compares two text files by mapping out all the words that are also in the English dictionary. The process works as follows:

- The English dictionary is pre-hashed into a matrix stored in `wordData/dict.json`.
    
- When the text files are read, the program creates a new matrix with the same structure as the dictionary, but filled with counts for each word.
    
- The program uses a hash function to quickly check if a word exists in the dictionary. Words not found in the dictionary are ignored.
    
- The two text matrices are then analyzed using vector operations:
    
    - **Angle Between Vectors:** Determines similarity using cosine similarity.
        
    - **Euclidean Distance:** Measures overall difference.
        
    - **Word Overlap Count:** Shows how many words are alike between the texts.
        

## Output

The comparison results are printed directly to the terminal.
