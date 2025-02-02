// src/game/game.service.ts
import { Injectable } from '@nestjs/common';
import { Card } from './models/card.model';
import { Deck } from './models/deck.model';
import { Player } from './models/player.model';
import { GameState } from './models/game-state.model';

@Injectable()
export class GameService {
  private deck: Deck;
  private players: Player[] = [];
  private gameState: GameState;

  constructor() {
    this.resetGame();
  }

  resetGame() {
    this.deck = new Deck();
    this.deck.shuffle();
    this.players = [];
    this.gameState = {
      stage: 'waiting', // could be 'pre-flop', 'flop', 'turn', 'river', 'showdown'
      communityCards: [],
      pot: 0,
    };
  }

  addPlayer(player: Player): Player {
    this.players.push(player);
    return player;
  }

  startGame() {
    if (this.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }

    // Reset the deck and shuffle
    this.deck = new Deck();
    this.deck.shuffle();

    // Deal two cards to each player (Texas Hold'em specific)
    this.players.forEach(player => {
      player.hand = this.deck.deal(2);
    });

    // Set game stage to pre-flop
    this.gameState.stage = 'pre-flop';

    // Initialize pot and any other game variables
    this.gameState.pot = 0;

    // Optionally, add more game logic here for betting rounds, etc.
  }

  /**
 * Returns the current game state.
 */
  getGameState(): GameState {
    return this.gameState;
  }

  // More methods for handling bets, folding, and progressing the game
}
