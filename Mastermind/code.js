"use strict";

class Code {
    constructor(parent) {
        this.parent = parent;
        this.domObj = document.createElement("div");
        this.domObj.classList.add("row");
        this.domObj.obj = this;
        this.colorArray = Array.from({ length: 4 }, (_, i) => {
            const col = new Color(this, i + 1);
            this.domObj.appendChild(col.domObj);
            return col;
        });
        this.visible = true;
        this.alreadyEvaluated = false;
    }

    getPrimitive() {
        return this.colorArray.map((color) => color.currentValue);
    }
}

class Master extends Code {
    constructor(parent) {
        super(parent);
        this.createButton(
            "Neues\nSpiel",
            "neuSpiel",
            () => this.parent.newGame(),
        );
        this.createButton("Zeig\nher", "visible", (e) => {
            this.toggleVisibility();
            e.target.innerText = this.visible ? "Ver-\nsteck" : "Zeig\nher";
        });
        this.shuffle();
        this.makeVisible(false);
    }

    createButton(text, className, onClick) {
        const button = document.createElement("button");
        button.obj = this;
        button.classList.add(className);
        button.innerHTML = text;
        button.addEventListener("click", onClick);
        this.domObj.appendChild(button);
    }

    getPossibilities() {
        const possibilities = [];
        const generatePossibilities = (arr = []) => {
            if (arr.length === 4) {
                possibilities.push(arr);
                return;
            }
            for (let i = 0; i < 6; i++) {
                generatePossibilities([...arr, i]);
            }
        };
        generatePossibilities();
        return possibilities;
    }

    shuffle() {
        this.colorArray.forEach((color) => color.randomize());
    }

    makeVisible(visible) {
        this.visible = visible;
        this.colorArray.forEach((color) => color.updateDisplay(visible));
    }

    toggleVisibility() {
        this.makeVisible(!this.visible);
    }
}

class Guess extends Code {
    constructor(parent, possibilities) {
        super(parent);
        this.possibilitiesInherited = possibilities;
        this.bewertung = null;
        this.bewertePegs = Array.from({ length: 4 }, (_, i) => {
            const peg = new BewertePeg(this, i + 1);
            this.domObj.appendChild(peg.domObj);
            return peg;
        });
        this.createButton("Bewerten", "bewerte", () => this.bewerte());
        this.createButton("Auto Rate", "autoGuess", () => this.autoGuess());
        parent.notify(
            possibilities.length === 1
                ? "Ich kenne die richtige Lösung ;)"
                : `Neuer Versuch, ${possibilities.length} gültige Möglichkeiten`,
        );
    }

    createButton(text, className, onClick) {
        const button = document.createElement("button");
        button.obj = this;
        button.classList.add(className);
        button.innerHTML = text;
        button.addEventListener("click", onClick);
        this.domObj.appendChild(button);
    }

    isComplete() {
        return this.colorArray.every((color) => color.isUpdated);
    }

    bewerte(master = null) {
        if (!this.isComplete()) {
            this.parent.notify("Code ist nicht fertig, kann nicht bewerten");
            return;
        }
        master = master || this.parent.master.getPrimitive();
        this.bewertung = this.getBewertung(master, this.getPrimitive());
        this.parent.notify(
            `Bewertung: ${this.bewertung[0]} schwarze und ${this.bewertung[1]
            } weisse`,
        );
        this.updateBewertungDisplay();
        if (!this.alreadyEvaluated) {
            this.bewertung[0] < 4
                ? this.parent.prependGuess()
                : this.parent.prependWin();
        } else {
            this.parent.notify("Ist schon bewertet!");
        }
        this.alreadyEvaluated = true;
    }

    updateBewertungDisplay() {
        let evaluationCount = 1;
        for (let i = 0; i < this.bewertung[0]; i++, evaluationCount++) {
            this.domObj.getElementsByClassName(`b${evaluationCount}`)[0].style
                .backgroundColor = "#000";
        }
        for (let i = 0; i < this.bewertung[1]; i++, evaluationCount++) {
            this.domObj.getElementsByClassName(`b${evaluationCount}`)[0].style
                .backgroundColor = "#fff";
        }
        for (; evaluationCount <= 4; evaluationCount++) {
            this.domObj.getElementsByClassName(`b${evaluationCount}`)[0].style
                .backgroundColor = "#888";
        }
    }

    getPossibilities() {
        return this.possibilitiesInherited.filter((poss) =>
            this.arraysEqual(
                this.getBewertung(poss, this.getPrimitive()),
                this.bewertung,
            )
        );
    }

    arraysEqual(one, two) {
        return one.length === two.length &&
            one.every((val, index) => val === two[index]);
    }

    getBewertung(master, guess) {
        const masterCopy = [...master];
        const guessCopy = [...guess];
        let schwarze = 0, weisse = 0;
        guessCopy.forEach((val, i) => {
            if (val === masterCopy[i]) {
                schwarze++;
                masterCopy[i] = guessCopy[i] = undefined;
            }
        });
        guessCopy.forEach((val, i) => {
            if (val !== undefined) {
                const index = masterCopy.indexOf(val);
                if (index !== -1) {
                    weisse++;
                    masterCopy[index] = undefined;
                }
            }
        });
        return [schwarze, weisse];
    }

    autoGuess() {
        const bestArray = this.getBestArray(this.possibilitiesInherited);
        const autoGuess =
            bestArray[Math.floor(Math.random() * bestArray.length)];
        this.updateSelf(autoGuess);
    }

    updateSelf(guess) {
        this.colorArray.forEach((color, i) => color.setInt(guess[i]));
    }

    getBestArray(arr) {
        const dict = new DiversityMap();
        arr.forEach((guess) => {
            const div = this.getDiversity(guess);
            if (!dict.has(div)) {
                dict.set(div, []);
            }
            dict.get(div).push(guess);
        });
        return dict.getMostDiverseArray();
    }

    getDiversity(arr) {
        return new Set(arr).size;
    }
}

class DiversityMap extends Map {
    getFullestArray() {
        return Array.from(this.values()).reduce(
            (max, arr) => arr.length > max.length ? arr : max,
            [],
        );
    }

    getMostDiverseArray() {
        return this.get(Array.from(this.keys()).sort().pop());
    }
}

class BewertePeg {
    constructor(parent, i) {
        this.parent = parent;
        this.domObj = document.createElement("div");
        this.domObj.classList.add("circle", "bew", `b${i}`);
    }
}

class RowWin {
    constructor(parent) {
        this.parent = parent;
        this.domObj = document.createElement("div");
        this.domObj.classList.add("row");
        const win = document.createElement("div");
        win.classList.add("win");
        win.innerHTML = "Gewonnen!";
        this.domObj.appendChild(win);
    }
}
