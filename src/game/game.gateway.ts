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
  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody() data: { name: string },
    @ConnectedSocket() client: Socket,
  ) {
    const newPlayer = new Player(data.name, client.id);
    this.gameService.addPlayer(newPlayer);
    // Broadcast updated game state to all connected clients
    client.broadcast.emit('gameUpdate', this.gameService);
    return { event: 'joined', data: newPlayer };
  }

  @SubscribeMessage('startGame')
  handleStartGame(@ConnectedSocket() client: Socket) {
    try {
      this.gameService.startGame();
      client.broadcast.emit('gameUpdate', this.gameService);
      return { event: 'gameStarted' };
    } catch (error) {
      return { event: 'error', message: error.message };
    }
  }

  // Add more event handlers (bet, fold, etc.)
}
