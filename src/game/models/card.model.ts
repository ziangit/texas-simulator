// src/game/models/card.model.ts
export class Card {
  suit: string; // "hearts", "diamonds", "clubs", "spades"
  value: number; // Numeric value (2-14)
  label: string; // "2", "3", ..., "J", "Q", "K", "A"

  constructor(suit: string, value: number, label: string) {
    this.suit = suit;
    this.value = value;
    this.label = label;
  }
}
