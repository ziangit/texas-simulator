// src/game/models/game-state.model.ts
import { Card } from './card.model';

export interface GameState {
  stage: 'waiting' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';
  communityCards: Card[];
  pot: number;
}
