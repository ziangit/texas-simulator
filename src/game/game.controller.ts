// src/game/game.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { Player } from './models/player.model';
import { JoinGameDto } from './dto/join-game.dto';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) { }

    @Get('state')
    getGameState() {
        // Return the current game state (you may want to wrap this in a proper DTO)
        return this.gameService.getGameState();
    }

    @Post('join')
    joinGame(@Body() payload: JoinGameDto) {
        const newPlayer = new Player(payload.name, payload.id);
        return this.gameService.addPlayer(newPlayer);
    }

}
