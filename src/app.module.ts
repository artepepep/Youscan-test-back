import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { WidgetsModule } from './widgets/widgets.module';

@Module({
  imports: [DatabaseModule, WidgetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
