const CHARSET_ALPHABET = "abcdefghijklmnopqrstuvwxyzöäüß"; // all letters from alphabet
const CHARSET_PROBABILITY = "enisratdhlcgmobwfkzpvjyxq"; // letters ordered by probability
const WORDLIST_PATH = "./wordlist-german.txt"; // (optional) provides word search features (regex)
const ignoredChars = [" ", "\r", "\n", ",", ".", "-", "_", ":", ";", "!", "?"]; // don't translate these chars