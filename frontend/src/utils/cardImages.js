export function getCardImage(rank, suit) {
    const rankMap = {
        "Ace": "ace", "2": "2", "3": "3", "4": "4", "5": "5",
        "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
        "Jack": "jack", "Queen": "queen", "King": "king"
    };
    const suitMap = {
        "Hearts": "hearts", "Diamonds": "diamonds",
        "Clubs": "clubs", "Spades": "spades"
    };

    const r = rankMap[rank];
    const s = suitMap[suit];
    return new URL(`../assets/cards/${r}_of_${s}.svg`, import.meta.url).href;
}

export function getCardBack() {
    return new URL('../assets/cards/card_back.png', import.meta.url).href;
}