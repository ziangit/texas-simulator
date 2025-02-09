// src/game/game.service.ts
import { Injectable } from '@nestjs/common';
import { Card } from './models/card.model';
// import { Deck } from './models/deck.model';
import { Deck } from './utils/deck';
import { Player } from './models/player.model';
import { GameState } from './models/game-state.model';
import { PokerHandEvaluator } from './utils/handEvaluator';

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
      currentTurn: '',
      highestBet: 0,
      currentBets: {},
      bettingComplete: false // Ensure players must bet before moving to the next stage
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

  startBettingRound() {
    // Reset betting status
    this.gameState.highestBet = 0;
    this.gameState.currentBets = {};
    this.gameState.bettingComplete = false;
    this.players.forEach(player => player.hasActed = false);

    // Set first player as current turn
    this.gameState.currentTurn = this.players[0].id;
  }


  placeBet(playerId: string, action: 'fold' | 'call' | 'raise' | 'check', amount?: number) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) throw new Error('Player not found');
    if (player.id !== this.gameState.currentTurn) throw new Error("Not your turn!");

    switch (action) {
      case 'fold':
        this.players = this.players.filter(p => p.id !== playerId); // Remove player
        break;
      case 'call':
        if (this.gameState.highestBet > (this.gameState.currentBets[playerId] || 0)) {
          const callAmount = this.gameState.highestBet - (this.gameState.currentBets[playerId] || 0);
          if (player.chips < callAmount) throw new Error("Not enough chips to call");
          player.chips -= callAmount;
          this.gameState.pot += callAmount;
          this.gameState.currentBets[playerId] = this.gameState.highestBet;
        }
        break;
      case 'raise':
        if (!amount || amount <= this.gameState.highestBet) throw new Error("Raise must be higher than the current bet");
        if (player.chips < amount) throw new Error("Not enough chips to raise");
        player.chips -= amount;
        this.gameState.pot += amount;
        this.gameState.highestBet = amount;
        this.gameState.currentBets[playerId] = amount;
        break;
      case 'check':
        if (this.gameState.highestBet > 0) throw new Error("Cannot check, someone has already bet");
        break;
    }

    player.hasActed = true;

    // Check if all players have acted
    if (this.players.every(p => p.hasActed)) {
      this.gameState.bettingComplete = true;
    } else {
      this.nextTurn();
    }
  }

  nextTurn() {
    const activePlayers = this.players.filter(p => p.chips > 0);
    const currentIndex = activePlayers.findIndex(p => p.id === this.gameState.currentTurn);

    // Move to the next player in the list
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    this.gameState.currentTurn = activePlayers[nextIndex].id;
  }



  startGame() {
    if (this.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }

    // Reset deck and deal two cards to each player (Texas Hold'em specific)
    this.deck = new Deck();
    this.deck.shuffle();

    this.gameState.pot = 0;
    this.gameState.highestBet = 2; // Set to BB amount

    // Deal two cards to each player (Texas Hold'em specific)
    this.players.forEach(player => {
      player.hand = this.deck.deal(2);
      player.hasActed = false; // Reset actions
    });

    // Set Blinds (assuming at least 2 players)
    this.players[0].chips -= 1; // Small Blind
    this.gameState.currentBets[this.players[0].id] = 1;
    this.players[1].chips -= 2; // Big Blind
    this.gameState.currentBets[this.players[1].id] = 2;

    this.gameState.pot = 3; // Sum of Small + Big Blinds

    // Set turn order (player after the BB goes first)
    this.gameState.currentTurn = this.players[2 % this.players.length].id;

    console.log("Game started! Small Blind and Big Blind posted.");
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

  showdown() {
    if (this.gameState.stage !== 'river') {
      throw new Error('Showdown can only happen after the river');
    }

    this.gameState.stage = 'showdown';

    let bestRank = 10; // Lower is better (1 = Royal Flush, 10 = High Card)
    let bestPlayers: { player: Player; hand: Card[] }[] = [];

    this.players.forEach(player => {
      const allCards = [...player.hand, ...this.gameState.communityCards];
      const { rank, bestHand } = PokerHandEvaluator.rankHand(allCards);

      if (rank < bestRank) {
        bestRank = rank;
        bestPlayers = [{ player, hand: bestHand }];
      } else if (rank === bestRank) {
        bestPlayers.push({ player, hand: bestHand });
      }
    });

    // If one winner, set them as the game winner
    if (bestPlayers.length === 1) {
      this.gameState.winner = bestPlayers[0].player.id;
    } else {
      // Handle tie-breaker if multiple players have the best hand
      this.gameState.winner = this.breakTies(bestPlayers);
    }

    console.log(`Winner: Player ${this.gameState.winner}`);
  }


  breakTies(players: { player: Player; hand: Card[] }[]): string {
    players.sort((a, b) => {
      for (let i = 0; i < 5; i++) {
        if (a.hand[i].value > b.hand[i].value) return -1; // `a` wins, move it up
        if (a.hand[i].value < b.hand[i].value) return 1;  // `b` wins, move it up
      }
      return 0; // Hands are exactly equal
    });

    return players[0].player.id; // Return the winning player's ID
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
