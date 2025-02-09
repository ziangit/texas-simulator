// src/game/models/game-state.model.ts
import { Card } from './card.model';
import { Player } from './player.model';

export type GameStage = 'waiting' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface GameState {
  stage: GameStage;
  communityCards: Card[];
  pot: number;
  players: Player[];
  currentTurn: string; // (player id whose turn it is)
  highestBet: number; // Highest bet made so far
  currentBets: Record<string, number>; // Each player's current bet
  bettingComplete: boolean; // Track if all players have acted
  winner?: string; // Player ID of the winner (optional, set at showdown)
  winningHand?: Card[]; // The best five-card hand of the winner


}
