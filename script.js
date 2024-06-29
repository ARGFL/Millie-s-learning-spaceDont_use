const words = ["apple", "banana","strawberries"];

const correctPronunciation = {
    "apple": "./recordingfruit/apple.mp3",
    "banana": "./recordingfruit/banana.mp3",
   "strawberries": "./recordingfruit/strawberries.mp3"
};

const retryAudio = "./retry.mp3"; // Audio file for retry message

const fruitImages = {
    "apple": "./images/apple.png",
    "banana": "./images/banana.png",
    "strawberries": "./images/strawberry.png"
};

const translations = {
    "apple": "măr",
    "banana": "banană",
    "strawberries": "căpsuni"
  
};

let currentWordIndex = 0;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
} else {
    alert('Speech Recognition API not supported in this browser.');
}

recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
    const userInput = event.results[0][0].transcript.toLowerCase().trim();
    checkPronunciation(userInput);
};

recognition.onerror = (event) => {
    console.error(event.error);
    alert('Speech recognition error: ' + event.error);
};

function playCorrectPronunciation() {
    const wordToPronounce = document.getElementById("wordToPronounce").textContent.toLowerCase();
    if (correctPronunciation[wordToPronounce]) {
        const audio = new Audio(correctPronunciation[wordToPronounce]);
        audio.play();
    } else {
        alert('Audio not available for this word.');
    }
}

function startRecognition() {
    recognition.start();
    recognitionResultHandled = false;
    setTimeout(() => {
        if (!recognitionResultHandled) {
            stopRecognition(); // Stop recognition after 5 seconds
            playAudioFeedback(retryAudio); // Play retry message audio if no recognition result
        }
    }, 5000);
}

function stopRecognition() {
    if (recognition) {
        recognition.stop();
    }
}

let recognitionResultHandled = false;

function levenshteinDistance(a, b) {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) {
        return bn;
    }
    if (bn === 0) {
        return an;
    }
    const matrix = new Array(bn + 1);
    for (let i = 0; i <= bn; ++i) {
        const row = (matrix[i] = new Array(an + 1));
        row[0] = i;
    }
    const firstRow = matrix[0];
    for (let j = 1; j <= an; ++j) {
        firstRow[j] = j;
    }
    for (let i = 1; i <= bn; ++i) {
        for (let j = 1; j <= an; ++j) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                             matrix[i - 1][j] + 1) // deletion
                );
            }
        }
    }
    return matrix[bn][an];
}

function checkPronunciation(userInput) {
    const wordToPronounce = document.getElementById("wordToPronounce").textContent.toLowerCase();
    const distance = levenshteinDistance(userInput, wordToPronounce);
    
    // Set a more lenient threshold for longer strings
    const threshold = Math.floor(wordToPronounce.length / 3);
    
    recognitionResultHandled = true;

    if (distance <= threshold) {
        playAudioFeedback('./positiveFeedback.mp3'); // Play positive feedback audio
    } else {
        playAudioFeedback(retryAudio); // Play retry message audio
    }
}

function playAudioFeedback(audioFile) {
    const audio = new Audio(audioFile);
    audio.play();
}

function nextWord() {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    const nextWord = words[currentWordIndex];
    
    document.getElementById("translation").textContent = translations[nextWord];
    document.getElementById("userInput").textContent = '';
    document.getElementById("fruitImage").alt = nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
    document.getElementById("wordToPronounce").textContent = nextWord;
    document.getElementById("fruitImage").src = fruitImages[nextWord];

    recognitionResultHandled = false;
}

// Initial setup for the first word
document.getElementById("translation").textContent = translations[words[currentWordIndex]];
document.getElementById("wordToPronounce").textContent = words[currentWordIndex];
document.getElementById("fruitImage").alt = words[currentWordIndex].charAt(0).toUpperCase() + words[currentWordIndex].slice(1);
document.getElementById("fruitImage").src = fruitImages[words[currentWordIndex]];