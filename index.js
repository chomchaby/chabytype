const wordsWrapper = document.querySelector("#wordsWrapper");
const wordsInput = document.querySelector("#wordsInput");
const outOfFocusWarning = document.querySelector(".outOfFocusWarning");
const caret = document.querySelector("#caret");
const words = document.querySelector("#words");

let currentLetterIndex;
let currentWordIndex;
let wordList;
let letterWidth;
let wordNumberOfFirstLine = 0;

const caretAnimationName = "caretFlashSmooth";
const wordLenghtLimit = 24;

// typing sound effect (temporary here) //
let soundEnabled = true;
const toggleSoundButton = document.querySelector("#toggle-sound");
toggleSoundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    toggleSoundButton.textContent = "Turn Sound Off";
  } else {
    toggleSoundButton.textContent = "Turn Sound On";
  }
});
////////////////////////////////////////

// bluring wrods wrapper if it is not focus
const blurWords = () => {
  if (document.activeElement !== wordsInput) {
    outOfFocusWarning.classList.remove("hidden");
    caret.classList.add("hidden");
    words.classList.add("blurred");
  }
};
const unblurWords = () => {
  wordsInput.focus();
  outOfFocusWarning.classList.add("hidden");
  caret.classList.remove("hidden");
  words.classList.remove("blurred");
};
wordsWrapper.addEventListener("click", () => {
  unblurWords();
});
window.addEventListener("keydown", (event) => {
  let k = event.keyCode;
  setTimeout(() => {
    if (k >= 33 && k <= 111) {
      unblurWords();
    }
  }, 5);
});
setInterval(blurWords, 2000);

// mouse move to play caret animation
window.addEventListener("mousemove", (event) => {
  caret.style.animationName = caretAnimationName;
});

const allHaveClass = (elements, classValue) => {
  return Array.from(elements).every((element) =>
    element.classList.contains(classValue)
  );
};
const someHaveClass = (elements, classValue) => {
  return Array.from(elements).some((element) =>
    element.classList.contains(classValue)
  );
};

const isPrintable = (keyCode) => {
  // character
  if (keyCode >= 48 && keyCode <= 90) return true;
  // digit
  if (keyCode >= 96 && keyCode <= 111) return true;
  // sign
  if (keyCode >= 186) return true;
  return false;
};

const moveTypingLine = () => {
  let newTop = wordList[currentWordIndex].offsetTop;
  // if enter the next line
  if (newTop > caret.offsetTop) {
    // if we are in the first line => no line to hide
    if (wordNumberOfFirstLine == 0) {
      wordNumberOfFirstLine = currentWordIndex;
    }
    // if we are in the second line => hide the first line
    else {
      for (let i = 0; i < wordNumberOfFirstLine; i++) {
        words.removeChild(words.firstChild);
      }
      // reset wordList and currentWordIndex
      wordList = document.querySelectorAll(".word");
      currentWordIndex = currentWordIndex - wordNumberOfFirstLine;
      console.log("word list", wordList);
      console.log(wordList[currentWordIndex]);
    }
  }
  // if enter the previous line
  if (newTop < caret.offsetTop) {
    wordNumberOfFirstLine = 0;
  }
};
const moveCaret = () => {
  // adjust caret top
  caret.style.top = wordList[currentWordIndex].offsetTop + "px";

  // adjust caret left
  caret.style.left =
    wordList[currentWordIndex].offsetLeft +
    currentLetterIndex * letterWidth +
    "px";

  // remove caret's animation
  caret.style.animationName = "none";
};

const leftSpace = () => {
  return caret.offsetLeft + letterWidth <
    wordsWrapper.getBoundingClientRect().width
    ? true
    : false;
};
const exceedLengthLimit = () => {
  return wordList[currentWordIndex].childNodes.length > wordLenghtLimit;
};

const onTyping = (event) => {
  let currentWord = wordList[currentWordIndex];
  // press 'spacebar'
  if (event.key === " ") {
    let letterElements = currentWord.querySelectorAll(".letter");
    if (
      someHaveClass(letterElements, "correct") ||
      someHaveClass(letterElements, "incorrect")
    ) {
      if (!allHaveClass(letterElements, "correct")) {
        currentWord.classList.add("error");
      }
      currentWord.classList.remove("active");
      currentWord.classList.add("typed");
      currentWordIndex = currentWordIndex + 1;
      wordList[currentWordIndex].classList.add("active");
      currentLetterIndex = 0;
    }
    wordsInput.value = "";
  }
  // press 'backspace'
  else if (event.key === "Backspace") {
    // delete letter in current word.
    if (currentLetterIndex > 0) {
      if (
        currentWord.childNodes[currentLetterIndex - 1].classList.contains(
          "extra"
        )
      ) {
        currentLetterIndex = currentLetterIndex - 1;
        currentWord.removeChild(currentWord.lastChild);
      } else {
        currentLetterIndex = currentLetterIndex - 1;
        currentWord.childNodes[currentLetterIndex].classList.remove("correct");
        currentWord.childNodes[currentLetterIndex].classList.remove(
          "incorrect"
        );
      }
    }
    // go back to previous word if it was error.
    else if (
      currentWordIndex > 0 &&
      wordList[currentWordIndex - 1].classList.contains("error")
    ) {
      currentWord.classList.remove("active");
      currentWordIndex = currentWordIndex - 1;
      wordList[currentWordIndex].classList.add("active");
      wordList[currentWordIndex].classList.remove("error");
      currentLetterIndex = wordList[currentWordIndex].childNodes.length;
    }
  }
  // press other key
  else if (isPrintable(event.keyCode)) {
    if (currentLetterIndex < currentWord.childNodes.length) {
      let currentLetter = currentWord.childNodes[currentLetterIndex];
      currentLetter.classList.add(
        event.key === currentLetter.innerText ? "correct" : "incorrect"
      );
    } else {
      if (!leftSpace() || exceedLengthLimit()) {
        wordsInput.value = wordsInput.value.slice(0, -1);
        return;
      }
      currentWord.innerHTML += `<span class="letter incorrect extra">${event.key}</span>`;
    }
    currentLetterIndex = currentLetterIndex + 1;
  }
  // move typing line and caret
  moveTypingLine();
  moveCaret();
  return;
};

const formatWord = (word) => {
  return `<div class="word"><span class="letter">${word
    .split("")
    .join('</span><span class="letter">')}</span></div>`;
};

// new test
const newTest = (rawWords) => {
  // set words
  words.innerHTML = "";
  for (let i = 0; i < rawWords.length; i++) {
    words.innerHTML += formatWord(rawWords[i]);
  }
  // initial current typing index
  currentLetterIndex = 0;
  currentWordIndex = 0;
  wordList = document.querySelectorAll(".word");
  wordList[currentWordIndex].classList.add("active");
  // set variables
  letterWidth = document.querySelector(".letter").getBoundingClientRect().width;
  // add event listener to input box
  wordsInput.addEventListener("keydown", (event) => {
    if (
      event.key === " " ||
      event.key === "Backspace" ||
      isPrintable(event.keyCode)
    ) {
      onTyping(event);
      if (soundEnabled) {
        const typingSoundEffect = new Audio(
          "./assets/sounds/typing-sound-effect.mp4"
        );
        typingSoundEffect.play();
      }
    }
  });
};

// let's play!
const rawWords =
  "although beneath concept determine essential familiar generate however imagine justice knowledge limit majority notice opinion purpose quality relevant satisfy tradition uncertain various wonder xylophone yield zealous abstract boundary challenge decision evidence fundamental grateful hypothesis indicate journey keynote legitimate motivation narrative objective potential reflect significant transform universal venture wisdom year zebra".split(
    " "
  );
const testWords =
  "line1 line1 line1 line1 line1 line1 line1 line2 line2 line2 line2 lind2 line2 line2 line3 line3 line3 line3 line3 line3 line3 line4 line4 line4 line4 line4 line4 line4".split(
    " "
  );
newTest(rawWords);
