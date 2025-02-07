// add some test code
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
// import { ServiceModule } from './service/service.module';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [GameModule, PlayerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
