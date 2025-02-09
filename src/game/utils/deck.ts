import { Card } from '../models/card.model';

export class Deck {
    private cards: Card[] = [];

    constructor() {
        this.initializeDeck();
        this.shuffle();
    }

    /** Initialize a standard 52-card deck */
    private initializeDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = [
            { label: '2', value: 2 },
            { label: '3', value: 3 },
            { label: '4', value: 4 },
            { label: '5', value: 5 },
            { label: '6', value: 6 },
            { label: '7', value: 7 },
            { label: '8', value: 8 },
            { label: '9', value: 9 },
            { label: '10', value: 10 },
            { label: 'J', value: 11 },
            { label: 'Q', value: 12 },
            { label: 'K', value: 13 },
            { label: 'A', value: 14 } // Ace is highest
        ];

        this.cards = [];

        for (const suit of suits) {
            for (const { label, value } of values) {
                this.cards.push(new Card(suit, value, label)); // Store numeric value & label
            }
        }
    }

    /** Shuffle the deck using Fisher-Yates algorithm */
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    /** Deal a specific number of cards */
    deal(num: number): Card[] {
        if (this.cards.length < num) {
            throw new Error('Not enough cards left in the deck');
        }
        return this.cards.splice(0, num);
    }

    /** Reset the deck (for a new game) */
    resetDeck() {
        this.initializeDeck();
        this.shuffle();
    }
}
