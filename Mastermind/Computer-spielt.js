"use strict";

function initComputerGuess() {
    const computerGuessField = document.getElementById("computerGuess");
    const evaluationField = document.getElementById("evaluation");

    const computerGuess = new Guess({ notify: (msg) => console.log(msg) }, []);
    computerGuessField.appendChild(computerGuess.domObj);

    const evaluationPegs = Array.from({ length: 4 }, (_, i) => {
        const peg = new BewertePeg(null, i + 1);
        evaluationField.appendChild(peg.domObj);
        return peg;
    });

    const evaluateButton = document.createElement("button");
    evaluateButton.innerText = "Bewerten";
    evaluateButton.onclick = () => {
        const blackPegs = parseInt(prompt("Anzahl der schwarzen Stifte:"));
        const whitePegs = parseInt(prompt("Anzahl der weißen Stifte:"));
        computerGuess.bewertung = [blackPegs, whitePegs];
        computerGuess.updateBewertungDisplay();
        if (blackPegs < 4) {
            computerGuess.autoGuess();
        } else {
            alert("Der Computer hat den Code erraten!");
        }
    };
    evaluationField.appendChild(evaluateButton);

    computerGuess.autoGuess();
}