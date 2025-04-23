import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { UsersModule } from '../../app/users';
import { RedisModule, RedisService } from '../../libs/modules/redis';
import { MailModule } from '../../libs/modules/mail';

import { AuthService } from './auth.service';
import { JwtGqlStrategy, JwtRefreshStrategy, JwtStrategy } from './strategies';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import authConfig from './config/auth-config';
import { OptionalAuthGuard } from './guards';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [authConfig],
        }),
        RedisModule,
        // ThrottlerModule.forRootAsync({
        //     imports: [ConfigModule, RedisModule],
        //     inject: [ConfigService, RedisService],
        //     useFactory: (configService: ConfigService, redisService: RedisService) => {
        //         return {
        //             throttlers: [
        //                 {
        //                     name: 'request-passwordless',
        //                     limit: 1,
        //                     ttl: 1000 * 60 * 3,
        //                 },
        //             ],
        //             storage: new ThrottlerStorageRedisService(redisService.getClient),
        //         };
        //     },
        // }),
        JwtModule.register({}),
        BullModule.registerQueue({
            name: 'BULLMQ_MAIL_QUEUE',
        }),
        PassportModule,
        MailModule,
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        JwtGqlStrategy,
        JwtRefreshStrategy,
        OptionalAuthGuard,
        // {
        //     provide: APP_GUARD,
        //     useClass: ThrottlerGuard,
        // },
    ],
    exports: [AuthService, OptionalAuthGuard],
})
export class AuthModule {}
