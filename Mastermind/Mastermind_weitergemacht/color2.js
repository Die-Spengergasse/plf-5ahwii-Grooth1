"use strict";

// Klasse für EINEN STECKER (PEG)
class Color {
    static rgbValues = [
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#ffff00",
        "#00ffff",
        "#ff00ff",
    ];

    static getRGB(i) {
        return this.rgbValues[i % this.rgbValues.length];
    }

    constructor(parent, num) {
        this.obj = parent;
        this.currentValue = 0;
        this.visible = true;
        this.isUpdated = false;
        this.domObj = document.createElement("div");
        this.domObj.obj = this;
        this.domObj.classList.add("circle", "peg", `s${num}`);
        this.domObj.addEventListener("click", (e) => {
            e.target.obj.rotate();
        });
    }

    updateDisplay(visible = true) {
        this.visible = visible;
        this.domObj.style.backgroundColor = visible
            ? Color.getRGB(this.currentValue)
            : "#ddd";
    }

    setColor(i, visible = true) {
        this.currentValue = i;
        this.updateDisplay(visible);
        this.isUpdated = true;
    }

    randomize() {
        this.setColor(Math.floor(Math.random() * 6), false);
    }

    rotate() {
        if (!this.visible) {
            this.obj.parent.notify("Ist unsichtbar -> Keine Änderung");
            return;
        }
        this.currentValue = this.isUpdated
            ? (this.currentValue + 1) % 6
            : this.currentValue;
        this.isUpdated = true;
        this.updateDisplay(true);
    }
}


function generateSecretCode() {
    const colors = [0, 1, 2, 3, 4, 5];
    let secretCode = [];
    for (let i = 0; i < 4; i++) {
        secretCode.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    displayColors(secretCode, 'codeDisplay');
    return secretCode;
}


function generateRandomColors() {
    const colors = [0, 1, 2, 3, 4, 5];
    let randomColors = [];
    for (let i = 0; i < 4; i++) {
        randomColors.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    return randomColors;
}


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


function autoFillColors() {
    const randomColors = generateRandomColors();
    displayColors(randomColors, 'colorInputs');
}


document.getElementById('autoFillButton').addEventListener('click', autoFillColors);


document.addEventListener("DOMContentLoaded", generateSecretCode);