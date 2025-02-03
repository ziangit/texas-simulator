// src/game/models/game-state.model.ts
import { Card } from './card.model';
import { Player } from './player.model';

export type GameStage = 'waiting' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface GameState {
  stage: GameStage;
  communityCards: Card[];
  pot: number;
  players: Player[];
  currentTurn?: string; // (player id whose turn it is)
}
