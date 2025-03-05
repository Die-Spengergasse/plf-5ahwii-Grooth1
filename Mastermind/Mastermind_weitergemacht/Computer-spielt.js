class Mastermind {
    constructor(length = 4, colors = [0, 1, 2, 3, 4, 5]) {
        this.length = length;
        this.colors = colors;
        this.secretCode = this.generateCode();
        this.attempts = [];
        this.possibleGuesses = this.generateAllCombinations();
        this.randomGuesses = this.shuffleArray([...this.possibleGuesses]);
    }

    generateCode() {
        return Array.from({ length: this.length }, () =>
            this.colors[Math.floor(Math.random() * this.colors.length)]
        );
    }

    generateAllCombinations() {
        const combinations = [];
        const generate = (prefix = []) => {
            if (prefix.length === this.length) {
                combinations.push(prefix);
                return;
            }
            for (let color of this.colors) {
                generate([...prefix, color]);
            }
        };
        generate();
        return combinations;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    makeGuess(guess) {
        if (guess.length !== this.length) {
            throw new Error(`Guess must be ${this.length} colors long.`);
        }

        let black = 0, white = 0;
        let secretCopy = [...this.secretCode];
        let guessCopy = [...guess];

        // Check for correct position and color
        for (let i = 0; i < this.length; i++) {
            if (guessCopy[i] === secretCopy[i]) {
                black++;
                secretCopy[i] = guessCopy[i] = null;
            }
        }

        // Check for correct color in wrong position
        for (let i = 0; i < this.length; i++) {
            if (guessCopy[i] && secretCopy.includes(guessCopy[i])) {
                white++;
                secretCopy[secretCopy.indexOf(guessCopy[i])] = null;
            }
        }

        return { black, white };
    }

    filterGuesses(feedback) {
        this.possibleGuesses = this.possibleGuesses.filter(guess => {
            const result = this.makeGuess(guess);
            return result.black === feedback.black && result.white === feedback.white;
        });
    }

    getNextGuess() {
        if (this.randomGuesses.length > 0) {
            return this.randomGuesses.shift();
        }
        return this.possibleGuesses.shift();
    }
}

const game = new Mastermind();

document.addEventListener("DOMContentLoaded", () => {
    const codeDisplay = document.getElementById("codeDisplay");
    const guessDisplay = document.getElementById("guessDisplay");
    const blackInput = document.getElementById("blackPins");
    const whiteInput = document.getElementById("whitePins");
    const submitFeedback = document.getElementById("submitFeedback");

    displayColors(game.secretCode, 'codeDisplay');
    let guess = game.getNextGuess();
    displayColors(guess, 'guessDisplay');

    submitFeedback.addEventListener("click", () => {
        let black = parseInt(blackInput.value) || 0;
        let white = parseInt(whiteInput.value) || 0;

        game.filterGuesses({ black, white });

        if (black === game.length) {
            guessDisplay.textContent = "Computer found the correct code!";
            return;
        }
        guess = game.getNextGuess();
        displayColors(guess, 'guessDisplay');
        blackInput.value = "";
        whiteInput.value = "";
    });

    // Auto Fill Button
    document.getElementById('autoFillButton').addEventListener('click', () => {
        const randomColors = game.getNextGuess();
        displayColors(randomColors, 'colorInputs');
    });
});

// Funktion zum Anzeigen der Farben
function displayColors(colors, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    colors.forEach(color => {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = Color.getRGB(color);
        container.appendChild(colorBox);
    });
}