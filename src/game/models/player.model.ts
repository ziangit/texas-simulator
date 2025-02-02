// src/game/models/player.model.ts
import { Card } from './card.model';

export class Player {
  public id: string;
  public name: string;
  public chips: number;
  public hand: Card[];

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
    this.chips = 1000; // Starting chips (adjust as needed)
    this.hand = [];
  }
}
