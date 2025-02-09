// src/game/models/player.model.ts
import { Card } from './card.model';

export class Player {
  id: string;
  name: string;
  chips: number = 100; // Start with 100 chips
  hand: Card[] = [];
  hasActed: boolean = false; // Track if player has made a move in the round

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}
