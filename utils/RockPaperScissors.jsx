function determineWinner(moves) {
    const [player1, player2] = Object.keys(moves);
    const move1 = moves[player1];
    const move2 = moves[player2];

    if (move1 === move2) return { winner: "draw", moves };
    if (
        (move1 === "rock" && move2 === "scissors") ||
        (move1 === "scissors" && move2 === "paper") ||
        (move1 === "paper" && move2 === "rock")
    ) {
        return { winner: player1, moves };
    } else {
        return { winner: player2, moves };
    }
}