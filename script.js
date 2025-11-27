// DOM Elements
const typingBox = document.getElementById("typing-box");
const hiddenInput = document.getElementById("hidden-input");
const retakeButton = document.getElementById("retake-test");
const booksListElement = document.getElementById("books-list");
const chaptersListElement = document.getElementById("chapters-list");
const currentBookElement = document.getElementById("current-book");
const headingElement = document.getElementById("heading");
const progressContainer = document.getElementById("progress-container");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");

// Lists of books
const OT_BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
  "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah",
  "Malachi"
];

const NT_BOOKS = [
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
  "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians",
  "2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James",
  "1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"
];

let currentTestament = "OT"; // default


// State
let selectedBook = null;
let selectedChapter = null;
let currentVerses = [];
let currentVerseIndex = 0;
let currentVerse = "";

let totalCorrect = 0;
let totalIncorrect = 0;

let startTime = null;
let endTime = null;
let totalTypedCharacters = 0;
let previousInput = "";

// Initialize the app
function initializeApp() {
  loadBooks();
  // Set initial active state (OT is default)
  document.getElementById("toggle-ot").classList.add("active");
}

// Load all books into the sidebar
function loadBooks() {
  booksListElement.innerHTML = "";

  const listToShow = currentTestament === "OT" ? OT_BOOKS : NT_BOOKS;

  listToShow.forEach(bookName => {
    if (!bibleData[bookName]) return; // safety

    const bookItem = document.createElement("div");
    bookItem.className = "book-item";
    bookItem.textContent = bookName;
    bookItem.onclick = () => selectBook(bookName);
    booksListElement.appendChild(bookItem);
  });
}


// Select a book and load its chapters
function selectBook(bookName) {
  selectedBook = bookName;
  selectedChapter = null;

  // Update active state
  document.querySelectorAll(".book-item").forEach(item => {
    item.classList.remove("active");
    if (item.textContent === bookName) {
      item.classList.add("active");
    }
  });

  currentBookElement.textContent = bookName;
  loadChapters(bookName);

  // Reset typing area
  typingBox.innerHTML = "";
  headingElement.textContent = "Select a chapter to begin";
  retakeButton.style.display = "none";
  progressContainer.style.display = "none";
}

// Load chapters for the selected book
function loadChapters(bookName) {
  chaptersListElement.innerHTML = "";

  const chapters = Object.keys(bibleData[bookName]);
  chapters.forEach(chapterNum => {
    const chapterItem = document.createElement("div");
    chapterItem.className = "chapter-item";
    chapterItem.textContent = chapterNum;
    chapterItem.onclick = () => selectChapter(chapterNum);
    chaptersListElement.appendChild(chapterItem);
  });
}

// Select a chapter and start typing
function selectChapter(chapterNum) {
  selectedChapter = chapterNum;

  // Update active state
  document.querySelectorAll(".chapter-item").forEach(item => {
    item.classList.remove("active");
    if (item.textContent === chapterNum) {
      item.classList.add("active");
    }
  });

  startChapter();
}

// Start typing the selected chapter
function startChapter() {
  currentVerses = Object.values(bibleData[selectedBook][selectedChapter]);
  currentVerseIndex = 0;
  startTime = null;
  endTime = null;
  totalTypedCharacters = 0;
  totalCorrect = 0;
  totalIncorrect = 0;
  previousInput = "";

  progressContainer.style.display = "block";
  loadVerse();
  hiddenInput.focus();
}

// Update progress bar
function updateProgress(currentCharacters = 0, totalCharacters = currentVerse.length) {
  const completedVerses = currentVerseIndex;
  const currentVerseProgress = currentCharacters / totalCharacters;
  const totalProgress = ((completedVerses + currentVerseProgress) / currentVerses.length) * 100;

  progressFill.style.width = `${totalProgress}%`;
  progressText.textContent = `${Math.round(totalProgress)}%`;
}

// Load a single verse
function loadVerse() {
  currentVerse = currentVerses[currentVerseIndex];
  retakeButton.style.display = "none";
  headingElement.style.display = "block";
  headingElement.textContent = `${selectedBook} ${selectedChapter}:${currentVerseIndex + 1}`;
  renderText();
  hiddenInput.value = "";
  previousInput = "";
  updateProgress(0, currentVerse.length);
}

// Render the text for typing
function renderText() {
  typingBox.innerHTML = "";
  for (let i = 0; i < currentVerse.length; i++) {
    const span = document.createElement("span");
    span.innerText = currentVerse[i];
    span.classList.add("char");
    if (i === 0) span.classList.add("cursor");
    typingBox.appendChild(span);
  }
}

// Update the display as user types
function updateTextDisplay(input) {
  const spans = typingBox.querySelectorAll(".char");

  for (let i = 0; i < spans.length; i++) {
    const char = input[i];

    spans[i].classList.remove("cursor");

    if (char == null) {
      spans[i].className = "char";
    } else if (char === currentVerse[i]) {
      spans[i].className = "char correct";
    } else {
      spans[i].className = "char incorrect";
    }
  }

  if (input.length < spans.length) {
    spans[input.length].classList.add("cursor");
  }

  // Update progress bar as user types
  updateProgress(input.length, currentVerse.length);

  // Move to next verse or end chapter
  if (input.length === currentVerse.length) {
    if (currentVerseIndex < currentVerses.length - 1) {
      currentVerseIndex++;
      setTimeout(() => loadVerse(), 300);
    } else {
      endTime = Date.now();
      setTimeout(() => endChapter(), 400);
    }
  }
}

// Display stats after completing a chapter
function endChapter() {
  const elapsedMilliseconds = endTime - startTime;
  const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
  const elapsedMinutes = (endTime - startTime) / 60000;

  const wpm = Math.round(totalTypedCharacters / 5 / elapsedMinutes);
  const accuracy =
    totalCorrect + totalIncorrect === 0
      ? 0
      : Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100);

  headingElement.style.display = "none";
  progressContainer.style.display = "none";

  typingBox.innerHTML = `
    <div class="stats-container">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">WPM</div>
          <div class="stat-value">${wpm}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Accuracy</div>
          <div class="stat-value">${accuracy}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Time</div>
          <div class="stat-value">${elapsedSeconds}s</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Correct / Total</div>
          <div class="stat-value">${totalCorrect}/${totalCorrect + totalIncorrect}</div>
        </div>
      </div>
    </div>
  `;

  retakeButton.style.display = "block";
  hiddenInput.blur();
}

// Retake the current chapter
function retakeTest() {
  if (selectedBook && selectedChapter) {
    startChapter();
  }
}

// Event listeners
hiddenInput.addEventListener("input", () => {
  const userInput = hiddenInput.value;

  if (startTime == null) {
    startTime = Date.now();
  }

  // Track mistakes even if corrected
  if (userInput.length > previousInput.length) {
    // User typed a new character
    const newCharIndex = previousInput.length;
    const typedChar = userInput[newCharIndex];
    const expectedChar = currentVerse[newCharIndex];

    if (typedChar === expectedChar) {
      totalCorrect++;
    } else {
      totalIncorrect++;
    }
    totalTypedCharacters++;
  } else if (userInput.length < previousInput.length) {
    // User backspaced - still counts as an error was made
    // Don't subtract from counts, the mistake already happened
  }

  previousInput = userInput;
  updateTextDisplay(userInput);
});

document.addEventListener("click", () => {
  if (selectedBook && selectedChapter) {
    hiddenInput.focus();
  }
});

document.getElementById("toggle-ot").onclick = function() {
  currentTestament = "OT";
  loadBooks();

  // Update active state
  this.classList.add("active");
  document.getElementById("toggle-nt").classList.remove("active");
};

document.getElementById("toggle-nt").onclick = function() {
  currentTestament = "NT";
  loadBooks();

  // Update active state
  this.classList.add("active");
  document.getElementById("toggle-ot").classList.remove("active");
};


// Navigation between home and typing app
document.getElementById("start-typing-btn").onclick = () => {
  document.getElementById("home-page").style.display = "none";
  document.getElementById("typing-app").style.display = "flex";
};

document.getElementById("back-home-btn").onclick = () => {
  document.getElementById("typing-app").style.display = "none";
  document.getElementById("home-page").style.display = "flex";
};

// Initialize on load
window.addEventListener("load", () => {
  initializeApp();
});
