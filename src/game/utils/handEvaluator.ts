import { Card } from '../models/card.model';

export class PokerHandEvaluator {
    static rankHand(cards: Card[]): { rank: number; bestHand: Card[] } {
        const allHands = PokerHandEvaluator.getAllFiveCardHands(cards);
        let bestRank = 10;
        let bestHand: Card[] = [];

        for (const hand of allHands) {
            const rank = PokerHandEvaluator.evaluateFiveCardHand(hand);
            if (rank < bestRank) {
                bestRank = rank;
                bestHand = hand;
            }
        }

        return { rank: bestRank, bestHand };
    }

    static getAllFiveCardHands(cards: Card[]): Card[][] {
        const combinations: Card[][] = [];
        const n = cards.length;

        function generate(start: number, combo: Card[]) {
            if (combo.length === 5) {
                combinations.push([...combo]);
                return;
            }
            for (let i = start; i < n; i++) {
                combo.push(cards[i]);
                generate(i + 1, combo);
                combo.pop();
            }
        }
        generate(0, []);
        return combinations;
    }

    static evaluateFiveCardHand(hand: Card[]): number {
        const values = hand.map(card => card.value);
        const suits = hand.map(card => card.suit);

        values.sort((a, b) => b - a);

        const isFlush = suits.every(suit => suit === suits[0]);
        const isStraight = values.every((val, idx, arr) =>
            idx === 0 || val === arr[idx - 1] - 1
        );

        const valueCounts = values.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        const pairs = Object.values(valueCounts).filter(count => count === 2).length;
        const threeOfAKind = Object.values(valueCounts).some(count => count === 3);
        const fourOfAKind = Object.values(valueCounts).some(count => count === 4);

        if (isFlush && isStraight && values[0] === 14) return 1; // Royal Flush
        if (isFlush && isStraight) return 2; // Straight Flush
        if (fourOfAKind) return 3; // Four of a Kind
        if (threeOfAKind && pairs === 1) return 4; // Full House
        if (isFlush) return 5; // Flush
        if (isStraight) return 6; // Straight
        if (threeOfAKind) return 7; // Three of a Kind
        if (pairs === 2) return 8; // Two Pair
        if (pairs === 1) return 9; // One Pair
        return 10; // High Card
    }
}
