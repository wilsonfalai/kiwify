import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const password = configService.get<string>('REDIS_PASSWORD');

        return {
          connection: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: Number(configService.get<string>('REDIS_PORT') ?? 6379),
            ...(password ? { password } : {}),
          },
        };
      },
    }),
  ],
})
export class AppModule {}
