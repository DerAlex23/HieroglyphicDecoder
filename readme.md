# Hieroglyphic Decoder
This is a very simple UI in HTML, Javascript and CSS for analyzing hieroglyphs/simple encrypted text.

## Applied Use Case 
I used it to decrypt a German text written in unknown symbols. I first assigned every symbol a letter, "translated" the text from symbols into letters (still encrypted, but now printable chars) and pasted the string into the UI.

## Features
- Can easily be adapted to other languages (see settings below)
- Analyses encrypted and creates statistics like probability of letters, bigrams (2 chars) and trigrams (3 chars)
- Maps most common encrypted chars to most common letters for initial "translation"
- Displays the text in translated characters which can be edited
- Each displayed character also has a small indicator that shows how often it is used
- If a character is edited, all related characters are updated
- You can flag characters as correct by right click (long press on smartphone/tablet)
- Randomize incorrect translations
- Save and load the correct translations
- Selected characters have a red border
- Correct characters have green border and glow
- Bigrams (encrypted characters) have a yellowish background (most common are bright, less common are dark)
- Trigrams (encrypted characters) have a blueish background (most common are bright, less common are dark)
- Charts of German bigrams, trigrams and first and last letter probabilities
- Word search which uses regex (if you want to use this, please see settings below)

## Settings
There is a `settings.js` file in the `js/` folder. If you want to change the language, adjust ignored characters or want to use the word list then this is the right place.
### Changing Language
Change `CHARSET_ALPHABET`s value to all letter of the language you want to use (e.g., English "abcdefghijklmnopqrstuvwxyz").
Then adjust `CHARSET_PROBABILITY` to you language. This string should contain all the letters of `CHARSET_ALPHABET`, but ordered by probability (e.g., English "eariotnslcudpmhgbfywkvxzjq").
If you need to you can add or remove characters from `ignoredChars`. Otherwise, you are done - have fun!
### Word List
The word list is a big file containing all (or many) words of a language. In my case I used this German word list (many thanks to the uploader): https://gist.github.com/MarvinJWendt/2f4f4154b8ae218600eb091a5706b5f4.
Place the file in the same folder as the `index.html` file. Adjust the `WORDLIST_PATH` value to match your file name.
Important: It may (probably) be the case that you cannot load this file if you are browsing the `index.html` file locally (because of `Cross-Origin Resource Sharing`) - it has to run on a http server. All other features are available. Of course feel free to adjust the `loadWorldList` function in `scripts.js` so it works locally.

# Licence
Software is published under Creative Commons Attribution-NonCommercial 4.0 International (`CC BY-NC 4.0 Deed`)

 You are free to:
- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material
- The licensor cannot revoke these freedoms as long as you follow the license terms.

Under the following terms:
- Attribution — You must give appropriate credit , provide a link to the license, and indicate if changes were made . You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- NonCommercial — You may not use the material for commercial purposes .
- No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


See https://creativecommons.org/licenses/by-nc/4.0/ for further information.