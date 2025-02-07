// src/game/game.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Player } from './models/player.model';

@WebSocketGateway({ cors: true })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) { }

  @SubscribeMessage('test')
  handleTest(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('Received test event:', data);
    // Emit a response back to the client
    // client.emit('testResponse', { message: 'Hello from NestJS' });
    this.server.emit('testResponse', { message: 'Hello from NestJS' })
  }

  @SubscribeMessage('requestStartGame')
  handleRequestStartGame(@ConnectedSocket() client: Socket) {
    try {
      console.log(`Player ${client.id} requested to restart the game.`);

      // Automatically record the vote for the initiator
      this.gameService.recordRestartVote(client.id, true);

      // Notify all other players about the restart request
      client.broadcast.emit('startGameRequest', { requester: client.id });

      return { event: 'startGameRequested', requester: client.id };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

  @SubscribeMessage('respondStartGame')
  handleRespondStartGame(
    @MessageBody() data: { accept: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Store the player's response
      this.gameService.recordRestartVote(client.id, data.accept);

      // Send vote update with correct structure
      const response = { playerId: client.id, accepted: data.accept };
      this.server.emit('restartVoteRecorded', response);

      // Check if all players have voted and reached a consensus
      if (this.gameService.allPlayersAgreed()) {
        this.gameService.startGame();
        this.gameService.resetVotes();
        this.server.emit('gameUpdate', this.gameService.getGameState());
        return { event: 'gameStarted', state: this.gameService.getGameState() };
      }

      return { event: 'restartVoteRecorded', playerId: client.id, accepted: data.accept };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }


  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody() data: { name: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const newPlayer = new Player(data.name, client.id);
      this.gameService.addPlayer(newPlayer);
      // Broadcast updated game state to all connected clients
      // client.broadcast.emit('gameUpdate', this.gameService.getGameState());
      this.server.emit('gameUpdate', this.gameService.getGameState());

      return { event: 'joined', data: newPlayer };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

  @SubscribeMessage('startGame')
  handleStartGame(@ConnectedSocket() client: Socket) {
    try {
      this.gameService.startGame();
      // Emit to all connected clients, including the sender
      // client.broadcast.emit('gameUpdate', this.gameService.getGameState());
      this.server.emit('gameUpdate', this.gameService.getGameState());
      return { event: 'gameStarted', state: this.gameService.getGameState() };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

  @SubscribeMessage('dealFlop')
  handleDealFlop(@ConnectedSocket() client: Socket) {
    try {
      this.gameService.dealFlop();
      // client.broadcast.emit('gameUpdate', this.gameService.getGameState());
      this.server.emit('gameUpdate', this.gameService.getGameState());

      return { event: 'flopDealt', state: this.gameService.getGameState() };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

  @SubscribeMessage('dealTurn')
  handleDealTurn(@ConnectedSocket() client: Socket) {
    try {
      this.gameService.dealTurn();
      // client.broadcast.emit('gameUpdate', this.gameService.getGameState());
      this.server.emit('gameUpdate', this.gameService.getGameState());

      return { event: 'turnDealt', state: this.gameService.getGameState() };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

  @SubscribeMessage('dealRiver')
  handleDealRiver(@ConnectedSocket() client: Socket) {
    try {
      this.gameService.dealRiver();
      // client.broadcast.emit('gameUpdate', this.gameService.getGameState());
      this.server.emit('gameUpdate', this.gameService.getGameState());
      return { event: 'riverDealt', state: this.gameService.getGameState() };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

  @SubscribeMessage('showdown')
  handleShowdown(@ConnectedSocket() client: Socket) {
    try {
      this.gameService.showdown();
      // client.broadcast.emit('gameUpdate', this.gameService.getGameState());
      this.server.emit('gameUpdate', this.gameService.getGameState());
      return { event: 'showdown', state: this.gameService.getGameState() };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

}
