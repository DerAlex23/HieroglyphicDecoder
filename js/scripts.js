// global variables
var translationCharset = CHARSET_PROBABILITY;
var hieroglyphCharset = "";
var hieroglyphText = "";
var wordList = "";

// dom references
const loadGlyphsButton = document.querySelector("#loadGlyphsButton");
const saveGlyphsButton = document.querySelector("#saveGlyphsButton");
const wordinput = document.querySelector("#wordinput");
const wordresults = document.querySelector("#wordresults");
const searchbutton = document.querySelector("#searchbutton");
const lockedTranslationsContainer = document.querySelector("#lockedTranslations");
const missingTranslationsContainer = document.querySelector("#missingTranslations");
const randomizeGlyphsButton = document.querySelector("#randomizeGlyphsButton");
const startWrapper = document.querySelector("#start-wrapper");
const translationWrapper = document.querySelector("#translation-wrapper");
const textInput = document.querySelector("#textInput");
const startButton = document.querySelector("#startButton");

function randomizeUnlockedGlyphs() {debugger
    // collect all unlocked glyphs
    const glyphElements = document.querySelectorAll("[data-locked='false']");
    let glyphsToShuffle = [];
    for (let i = 0; i < glyphElements.length; i++) {
        const element = glyphElements[i];
        const glyph = element.dataset["glyph"];
        if(glyphsToShuffle.indexOf(glyph) == -1) {
            glyphsToShuffle.push(glyph);
        }
    }
    if(glyphsToShuffle.length <= 1)
        return;
    // get untranslated chars
    const translationState = getTranslationState();
    const untranslatedCharArray = translationState.missingAlphabet.split("");
    // make sure there are enough untranslated chars
    while(untranslatedCharArray.length < glyphsToShuffle.length) {
        const randomCharIndex = Math.floor(Math.random() * glyphsToShuffle.length);
        untranslatedCharArray.push(untranslatedCharArray[randomCharIndex]);
    }
    // for arbitrary amount of times, randomize the untranslated chars
    for (let i = 0; i < 100; i++) {
        const randomIndexA = Math.floor(Math.random() * untranslatedCharArray.length);
        let randomIndexB = randomIndexA;
        while(randomIndexA == randomIndexB)
            randomIndexB = Math.floor(Math.random() * untranslatedCharArray.length);
        const swap = untranslatedCharArray[randomIndexA];
        untranslatedCharArray[randomIndexA] = untranslatedCharArray[randomIndexB];
        untranslatedCharArray[randomIndexB] = swap;
    }
    // apply new translations to the glyphs
    for (let i = 0; i < glyphsToShuffle.length; i++) {
        const glyph = glyphsToShuffle[i];
        const translation = untranslatedCharArray[i];
        const glyphElements = document.querySelectorAll("[data-glyph='"+glyph+"']");
        for (let j = 0; j < glyphElements.length; j++) {
            const element = glyphElements[j];
            element.dataset["translation"] = translation;
            element.querySelector("input").value = translation;
        }
    }
}

function startTranslation() {
    // store input and hide start form
    hieroglyphText = textInput.value;
    startWrapper.style.display = "none";
    // get probability of letters and patterns (2 chars and 3 chars)
    const statistics = getStatistics(hieroglyphText);
    const orderedStatistics = orderStatistics(statistics);
    // create bigram and trigram arrays and charset string from letter statistic
    let bigrams = [];
    let trigrams = [];
    for (let i = 0; i < orderedStatistics.length; i++) {
        const charStatistic = orderedStatistics[i];
        if(charStatistic.char.length == 1)
            hieroglyphCharset += charStatistic.char;
        else if(charStatistic.char.length == 2)
            bigrams.push(charStatistic);
        else if(charStatistic.char.length == 3)
            trigrams.push(charStatistic);
        
    }
    bigrams.sort(function(a,b){ return b.count - a.count; });
    trigrams.sort(function(a,b){ return b.count - a.count; });
    // create dom elements
    let grams = {};
    for (let i = 0; i < hieroglyphText.length; i++) {
        const glyph = hieroglyphText[i];
        // line feed check
        if(glyph == "\r" || glyph == "\n") {
            createLineBreakElement(translationWrapper);
            continue;
        }
        // ignored char check
        if(containsIgnoredChars(glyph)) {
            createConstantElement(glyph, translationWrapper);
            continue;
        }
        // get translation and glyph count
        const translation = translateGlyph(glyph);
        const glyphCount = statistics[glyph];
        // check whether this and its following chars are bi- or trigrams
        const bigram = hieroglyphText.substring(i, i+2);
        const trigram = hieroglyphText.substring(i, i+3);
        const is1Bigram = bigrams.length > 0 && bigrams[0].char == bigram;
        const is2Bigram = bigrams.length > 1 && bigrams[1].char == bigram;
        const is3Bigram = bigrams.length > 2 && bigrams[2].char == bigram;
        const is1Trigram = trigrams.length > 0 && trigrams[0].char == trigram;
        const is2Trigram = trigrams.length > 1 && trigrams[1].char == trigram;
        const is3Trigram = trigrams.length > 2 && trigrams[2].char == trigram;
        // if its some kind of *gram, set the representation in 'grams' array to corresponing gram length
        if(is1Bigram)
            grams["bigram1"] = 2;
        if(is2Bigram)
            grams["bigram2"] = 2;
        if(is3Bigram)
            grams["bigram3"] = 2;
        if(is1Trigram)
            grams["trigram1"] = 3;
        if(is2Trigram)
            grams["trigram2"] = 3;
        if(is3Trigram)
            grams["trigram3"] = 3;
        let gramIndicator = Object.keys(grams);
        // create glyph
        createGlyphElement(glyph, glyphCount, gramIndicator, translation, translationWrapper);
        // delete bi- and trigrams which ends with this key
        const keysToDelete = [];
        for (const [key, count] of Object.entries(grams)) {
            grams[key] = count - 1;
            if(grams[key] == 0)
                keysToDelete.push(key);
        }
        for (let i = 0; i < keysToDelete.length; i++) {
            const key = keysToDelete[i];
            delete grams[key];
        }
    }
    // refresh the "solved and missing" ui and show everything to the user
    refreshLockedTranslations();
    translationWrapper.style.display = "block";
}

function translateGlyph(glyph) {
    const changeIndex = hieroglyphCharset.indexOf(glyph);
    return translationCharset[changeIndex];
}

function createLineBreakElement(parent) {
    const element = document.createElement("br");
    parent.appendChild(element);
}

function createConstantElement(text, parent) {
    const element = document.createElement("div");
    element.classList.add("glyph");
    const input = document.createElement("input");
    input.value = text;
    input.disabled = "disabled";
    element.appendChild(input);
    parent.appendChild(element);
}

function createGlyphElement(glyph, glyphCount, gramIndicators, translation, parent) {
    // create div container
    const element = document.createElement("div");
    parent.appendChild(element);
    element.addEventListener("contextmenu", lockGlyph);
    element.addEventListener("click", selectGlyph);
    element.classList.add("glyph");
    // add gylph information to dataset
    element.dataset["glyph"] = glyph;
    element.dataset["locked"] = "false";
    element.dataset["translation"] = translation;
    // add bi- and trigram indicators to element
    for (let i = 0; i < gramIndicators.length; i++) {
        const gramIndicator = gramIndicators[i];
        element.classList.add(gramIndicator);
    }
    // create content wrapper
    const contentWrapper = document.createElement("div");
    contentWrapper.classList.add("wrapper");
    element.appendChild(contentWrapper);
    // create input element
    const input = document.createElement("input");
    input.value = translation;
    input.addEventListener("keyup", glyphInputChanged);
    contentWrapper.appendChild(input);
    // create glyph count text
    const counter = document.createElement("small");
    counter.textContent = glyphCount;
    contentWrapper.appendChild(counter);
}

function selectGlyph(event) {
    // get glyph element from click event
    let glyphElement = getGlyphElement(event);
    if(!glyphElement)
        return;
    unselectGlyphs();
    // select all dom element representing the glyph
    const glyph = glyphElement.dataset["glyph"];
    const allGlyphElements = document.querySelectorAll("[data-glyph='"+glyph+"']");
    for (let i = 0; i < allGlyphElements.length; i++) {
        const glyphElement = allGlyphElements[i];
        glyphElement.classList.add("selected");
    }
    event.stopPropagation();
}

function unselectGlyphs() {
    const selectedGlyphElements = document.querySelectorAll(".selected");
    for (let i = 0; i < selectedGlyphElements.length; i++) {
        const glyphElement = selectedGlyphElements[i];
        glyphElement.classList.remove("selected");
    }
}

function lockGlyph(event) {
    // get glyph element from click event
    let glyphElement = getGlyphElement(event);
    if(!glyphElement)
        return;
    // get and alter lock state
    const glyph = glyphElement.dataset["glyph"];
    let locked = glyphElement.dataset["locked"];
    locked = locked == "true" ? "false" : "true";
    // apply new lock state to all elements representing the glyph
    const allGlyphElements = document.querySelectorAll("[data-glyph='"+glyph+"']");
    for (let i = 0; i < allGlyphElements.length; i++) {
        const otherGlyphElement = allGlyphElements[i];
        otherGlyphElement.dataset["locked"] = locked;
    }
    // refresh ui and select the locked glyph
    refreshLockedTranslations();
    event.preventDefault();
    selectGlyph(event);
}

function saveGlyphs() {
    let saveObj = {};
    const lockedGlyphElements = document.querySelectorAll("[data-locked='true']");
    for (let i = 0; i < lockedGlyphElements.length; i++) {
        const element = lockedGlyphElements[i];
        const glyph = element.dataset["glyph"];
        const translation = element.dataset["translation"];
        if(!(glyph in saveObj))
            saveObj[glyph] = translation;
    }
    prompt("Current Translation Map:", JSON.stringify(saveObj));
}

function loadGlyphs() {
    // read user input and parse the map
    let saveString = prompt("Translation Map to load:");
    if(!saveString)
        return;
    let saveObj;
    try {
        saveObj = JSON.parse(saveString);   
    } catch (error) {
        alert("Invalid translation map!");
        return;
    }
    // unlock all locked glyphs
    const lockedGlyphElements = document.querySelectorAll("[data-locked='true']");
    for (let i = 0; i < lockedGlyphElements.length; i++) {
        const element = lockedGlyphElements[i];
        element.dataset["locked"] = "false";
    }
    // apply map to all glyphs
    for (const [glyph, translation] of Object.entries(saveObj)) {
        const elements = document.querySelectorAll("[data-glyph='" + glyph + "']");
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            element.dataset["locked"] = "true";
            element.dataset["translation"] = translation;
            element.querySelector("input").value = translation;
        }
    }
    refreshLockedTranslations();
}

function getTranslationState() {
    const lockedGlyphElements = document.querySelectorAll("[data-locked='true']");
    const translationArray = getTranslationSummaryFromElements(lockedGlyphElements);
    const missingAlphabet = getAlphabetExcludingTranslated(translationArray);
    return {
        translationArray: translationArray,
        missingAlphabet: missingAlphabet
    }
}

function refreshLockedTranslations() {
    const translationState = getTranslationState();
    const solvedString = translationState.translationArray.toString();
    const missingString = translationState.missingAlphabet.split("").toString();
    lockedTranslationsContainer.textContent = "Solved: " + solvedString;
    missingTranslationsContainer.textContent = "Missing: " + missingString;
}

function getAlphabetExcludingTranslated(translationArray) {
    let alphabet = CHARSET_ALPHABET;
    for (let i = 0; i < translationArray.length; i++)
        alphabet = alphabet.replace(translationArray[i], "");
    return alphabet;
}

function getTranslationSummaryFromElements(glyphElements) {
    let lockedTranslations = [];
    let processedGlyphs = [];
    for (let i = 0; i < glyphElements.length; i++) {
        const element = glyphElements[i];
        const glyph = element.dataset["glyph"];
        const translation = element.dataset["translation"];
        if(processedGlyphs.indexOf(glyph) == -1) {
            processedGlyphs.push(glyph);
            lockedTranslations.push(translation);
        }
    }
    lockedTranslations.sort();
    return lockedTranslations;
}

function getGlyphElement(event) {
    // checks if element is a glyph and if not repeat with parent until is glyph or null
    let glyphElement = event.target;
    while(glyphElement && !glyphElement.classList.contains("glyph"))
        glyphElement = glyphElement.parentElement;
    return glyphElement;
}

function glyphInputChanged(event) {
    // apply change to all glyph elements
    let glyphElement = getGlyphElement(event);
    if(!glyphElement)
        return;
    const glyph = glyphElement.dataset["glyph"];
    const translation = event.target.value;
    glyphElement.dataset["translation"] = translation;
    const allGlyphElements = document.querySelectorAll("[data-glyph='"+glyph+"']");
    for (let i = 0; i < allGlyphElements.length; i++) {
        const otherGlyphElement = allGlyphElements[i];
        if(otherGlyphElement == glyphElement)
            continue;
        otherGlyphElement.querySelector("input").value = translation;
        otherGlyphElement.dataset["translation"] = translation;
    }
    const changeIndex = hieroglyphCharset.indexOf(glyph);
    translationCharset[changeIndex] = translation;
    refreshLockedTranslations();
}

function containsIgnoredChars(text) {
    for (let i = 0; i < ignoredChars.length; i++) {
        const char = ignoredChars[i];
        if(text.indexOf(char) > -1)
            return true;
    }
    return false;
}

function getStatistics(text) {
    // counts the number of chars in the text
    const patternLen = 3;
    const statistics = {};
    for (let i = 0; i < text.length; i++) {
        for (let j = 0; j <= patternLen; j++) {
            const pattern = text.substr(i, j+1);
            if(containsIgnoredChars(pattern))
                continue;
            if(pattern in statistics)
                statistics[pattern] += 1;
            else
                statistics[pattern] = 1;
        }
    }
    return statistics
}

function orderStatistics(statistics) {
    let orderedStats = [];
    for (const [char, count] of Object.entries(statistics)) {
        orderedStats.push({
            char: char,
            count: count
        });
    }
    orderedStats.sort(function(a,b){ return b.count - a.count; });
    return orderedStats;
}

function loadWorldList() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            wordList = xhr.responseText;
        }
    }
    xhr.open('GET', WORDLIST_PATH);
    xhr.send();
}

function searchWorldlist(){
    const pattern = new RegExp("^" + wordinput.value + "$", 'gmi');
    const matches = wordList.matchAll(pattern);
    wordresults.textContent = "";
    for(let match of matches) {
        wordresults.textContent += match[0] + "\r\n";
    }
}

function bindEventHandler() {
    document.body.addEventListener("click", unselectGlyphs);
    startButton.addEventListener("click", startTranslation);
    loadGlyphsButton.addEventListener("click", loadGlyphs);
    saveGlyphsButton.addEventListener("click", saveGlyphs);
    searchbutton.addEventListener("click", searchWorldlist);
    randomizeGlyphsButton.addEventListener("click", randomizeUnlockedGlyphs);
}

bindEventHandler();
loadWorldList();