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
  private disconnectedPlayers: Map<string, Player> = new Map(); // Track disconnected players

  constructor() {
    this.resetGame();
  }

  resetGame() {
    this.deck = new Deck();
    this.deck.shuffle();
    this.players = [];
    this.disconnectedPlayers.clear(); // Reset disconnected players on a new game
    this.gameState = {
      stage: 'waiting', // 'pre-flop', 'flop', 'turn', 'river', 'showdown'
      communityCards: [],
      pot: 0,
      players: this.players,
    };
  }

  addPlayer(player: Player): Player {
    // If game is already started, prevent joining
    if (this.gameState.stage !== 'waiting') {
      throw new Error('Cannot join after game has started');
    }
    this.players.push(player);
    return player;
  }

  startGame() {
    if (this.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }

    // Reset deck and deal two cards to each player (Texas Hold'em specific)
    this.deck = new Deck();
    this.deck.shuffle();

    // Deal two cards to each player (Texas Hold'em specific)
    this.players.forEach(player => {
      player.hand = this.deck.deal(2);
    });

    // Set game stage to pre-flop
    this.gameState.stage = 'pre-flop';
    this.gameState.communityCards = [];

    // Initialize pot and any other game variables
    this.gameState.pot = 0;

    // Set currentTurn
    this.gameState.currentTurn = this.players[0].id;
  }


  // Progress the game to the next stage:
  dealFlop() {
    if (this.gameState.stage !== 'pre-flop') {
      throw new Error('Flop can only be dealt after pre-flop');
    }
    // Burn a card (optional)
    this.deck.deal(1);
    // Deal 3 community cards
    const flop = this.deck.deal(3);
    this.gameState.communityCards.push(...flop);
    this.gameState.stage = 'flop';
  }

  dealTurn() {
    if (this.gameState.stage !== 'flop') {
      throw new Error('Turn can only be dealt after the flop');
    }
    // Burn a card (optional)
    this.deck.deal(1);
    // Deal one card
    const turn = this.deck.deal(1);
    this.gameState.communityCards.push(...turn);
    this.gameState.stage = 'turn';
  }

  dealRiver() {
    if (this.gameState.stage !== 'turn') {
      throw new Error('River can only be dealt after the turn');
    }
    // Burn a card (optional)
    this.deck.deal(1);
    // Deal one card
    const river = this.deck.deal(1);
    this.gameState.communityCards.push(...river);
    this.gameState.stage = 'river';
  }

  // When both players have taken actions, move to showdown:
  showdown() {
    if (this.gameState.stage !== 'river') {
      throw new Error('Showdown can only happen after the river');
    }
    this.gameState.stage = 'showdown';
    // Winner calculation could be added here; for now, just reveal hands.
  }
  /**
 * Returns the current game state.
 */
  getGameState(): GameState {
    return this.gameState;
  }

  private restartVotes: Map<string, boolean> = new Map(); // Track votes (playerId -> accept/reject)

  recordRestartVote(playerId: string, accept: boolean) {
    console.log(`Player ${playerId} voted: ${accept}`);
    this.restartVotes.set(playerId, accept);
  }

  allPlayersAgreed(): boolean {
    console.log("Checking if all players agreed...");
    console.log("Votes so far:", this.restartVotes);
    console.log("Total Players:", this.players.length);

    if (this.players.length === 0) return false;

    // All players must have voted, and all must agree
    return (
      this.restartVotes.size === this.players.length &&
      Array.from(this.restartVotes.values()).every(vote => vote === true)
    );
  }

  resetVotes() {
    console.log("Resetting votes...");
    this.restartVotes.clear();
  }

}
