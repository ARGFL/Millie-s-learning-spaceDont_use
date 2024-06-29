const words = ["apple", "banana", "strawberries"];

const correctPronunciation = {
    "apple": "/recordingfruit/apple.mp3",
    "banana": "/recordingfruit/banana.mp3",
    "strawberries": "/recordingfruit/strawberries.mp3"
};

const retryAudio = "/retry.mp3"; // Audio file for retry message

const fruitImages = {
    "apple": "/images/apple.png",
    "banana": "/images/banana.png",
    "strawberries": "/images/strawberry.png"
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
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const userInput = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Recognized:", userInput);
        checkPronunciation(userInput);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        alert('Speech recognition error: ' + event.error);
    };

    recognition.onend = () => {
        console.log("Speech recognition service disconnected");
    };
} else {
    alert('Speech Recognition API not supported in this browser.');
}

function playCorrectPronunciation() {
    const wordToPronounce = document.getElementById("wordToPronounce").textContent.toLowerCase();
    if (correctPronunciation[wordToPronounce]) {
        const audio = new Audio(correctPronunciation[wordToPronounce]);
        audio.play();
    } else {
        alert('Audio not available for this word.');
    }
}

function replayWord() {
    const wordToPronounce = document.getElementById("wordToPronounce").textContent.toLowerCase();
    if (correctPronunciation[wordToPronounce]) {
        const audio = new Audio(correctPronunciation[wordToPronounce]);
        audio.play();
    } else {
        alert('Audio not available for this word.');
    }
}

function startRecognition() {
    console.log("Starting speech recognition...");
    recognition.start();
}

function stopRecognition() {
    if (recognition) {
        recognition.stop();
    }
}

function checkPronunciation(userInput) {
    const wordToPronounce = document.getElementById("wordToPronounce").textContent.toLowerCase();
    const distance = levenshteinDistance(userInput, wordToPronounce);
    let threshold = Math.ceil(wordToPronounce.length / 3);

    console.log("Checking pronunciation:", userInput, "against:", wordToPronounce, "with threshold:", threshold, "distance:", distance);

    if (distance <= threshold) {
        console.log("Pronunciation correct, playing positive feedback.");
        playAudioFeedback('/positiveFeedback.mp3');
        document.getElementById("nextWordButton").disabled = false;
    } else {
        console.log("Pronunciation incorrect, playing retry feedback.");
        playAudioFeedback(retryAudio);
    }
}

function playAudioFeedback(audioFile) {
    const audio = new Audio(audioFile);
    audio.play();
    audio.onerror = () => {
        console.error("Failed to load audio file:", audioFile);
    };
}

function nextWord() {
    // Increment the current word index to move to the next word
    currentWordIndex = (currentWordIndex + 1) % words.length;
    const nextWord = words[currentWordIndex];

    // Update elements for the next word
    document.getElementById("wordToPronounce").textContent = nextWord;
    document.getElementById("fruitImage").src = fruitImages[nextWord];
    document.getElementById("fruitImage").alt = nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
    document.getElementById("translation").textContent = translations[nextWord];

    // Reset the writing practice inputs
    document.getElementById("writingInput").value = '';
    document.getElementById("writingFeedback").textContent = '';

    // Always show the pronunciation section and hide the writing practice section
    document.getElementById("pronunciation").style.display = "block";
    document.getElementById("writing-practice").style.display = "none";

    // Disable the next word button until it is appropriate to use it again
    document.getElementById("nextWordButton").disabled = true;
}

function showWritingPractice() {
    document.getElementById("pronunciation").style.display = "none";
    document.getElementById("writing-practice").style.display = "block";
    replayWord();
}

function hideWritingPractice() {
    document.getElementById("pronunciation").style.display = "block";
    document.getElementById("writing-practice").style.display = "none";
    document.getElementById("nextWordButton").disabled = true;
}

function checkWriting() {
    const userInput = document.getElementById("writingInput").value.toLowerCase().trim();
    const correctWord = document.getElementById("wordToPronounce").textContent.toLowerCase();
    const feedbackElement = document.getElementById("writingFeedback");
    const nextWordButton = document.getElementById("nextWordButton");

    if (userInput === correctWord) {
        feedbackElement.textContent = "Correct! Well done.";
        feedbackElement.style.color = "green";
        nextWordButton.disabled = false;
    } else {
        feedbackElement.textContent = "Incorrect, please try again.";
        feedbackElement.style.color = "red";
        nextWordButton.disabled = true;
    }
}

function levenshteinDistance(a, b) {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    const matrix = new Array(bn + 1);

    for (let i = 0; i <= bn; ++i) {
        matrix[i] = new Array(an + 1);
        matrix[i][0] = i;
    }
    for (let j = 0; j <= an; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= bn; i++) {
        for (let j = 1; j <= an; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1, // Deletion
                    matrix[i][j - 1] + 1, // Insertion
                    matrix[i - 1][j - 1] + 1 // Substitution
                );
            }
        }
    }
    return matrix[bn][an];
}