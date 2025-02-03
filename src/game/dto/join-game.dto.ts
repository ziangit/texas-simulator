// join-game.dto.ts
import { IsString } from 'class-validator';

export class JoinGameDto {
    @IsString()
    name: string;

    @IsString()
    id: string;
}
