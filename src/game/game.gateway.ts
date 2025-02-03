// src/game/game.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameService } from './game.service';
import { Player } from './models/player.model';

@WebSocketGateway({ cors: true })
export class GameGateway {
  constructor(private readonly gameService: GameService) { }

  @SubscribeMessage('test')
  handleTest(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('Received test event:', data);
    // Emit a response back to the client
    client.emit('testResponse', { message: 'Hello from NestJS' });
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
      client.broadcast.emit('gameUpdate', this.gameService.getGameState());
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
      client.broadcast.emit('gameUpdate', this.gameService.getGameState());
      // client.server.emit('gameUpdate', this.gameService.getGameState());
      return { event: 'gameStarted', state: this.gameService.getGameState() };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

  @SubscribeMessage('dealFlop')
  handleDealFlop(@ConnectedSocket() client: Socket) {
    try {
      this.gameService.dealFlop();
      client.broadcast.emit('gameUpdate', this.gameService.getGameState());
      return { event: 'flopDealt', state: this.gameService.getGameState() };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

  @SubscribeMessage('dealTurn')
  handleDealTurn(@ConnectedSocket() client: Socket) {
    try {
      this.gameService.dealTurn();
      client.broadcast.emit('gameUpdate', this.gameService.getGameState());
      return { event: 'turnDealt', state: this.gameService.getGameState() };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

  @SubscribeMessage('dealRiver')
  handleDealRiver(@ConnectedSocket() client: Socket) {
    try {
      this.gameService.dealRiver();
      client.broadcast.emit('gameUpdate', this.gameService.getGameState());
      return { event: 'riverDealt', state: this.gameService.getGameState() };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

  @SubscribeMessage('showdown')
  handleShowdown(@ConnectedSocket() client: Socket) {
    try {
      this.gameService.showdown();
      client.broadcast.emit('gameUpdate', this.gameService.getGameState());
      return { event: 'showdown', state: this.gameService.getGameState() };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

}
