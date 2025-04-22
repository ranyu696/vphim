import { Injectable, ExecutionContext, CanActivate, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

import { UserJwt } from '../strategies/types';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
    constructor(private configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const jwtSecret = this.configService.getOrThrow('AUTH_JWT_SECRET');

        // Handle different context types
        switch (context?.getType() || 'graphql') {
            case 'graphql': {
                const gqlReq = GqlExecutionContext.create(context).getContext().req;
                const authHeader = gqlReq?.headers?.authorization?.split(' ')[1];

                if (!authHeader) {
                    return true; // No token, allow the request to proceed
                }

                try {
                    const userDecoded = verify(authHeader, jwtSecret) as UserJwt;
                    if (typeof userDecoded === 'string') {
                        throw new UnauthorizedException('Invalid token format');
                    }

                    // Add validated user to request
                    gqlReq.user = userDecoded;
                    return true;
                } catch (error) {
                    throw new UnauthorizedException('Invalid or expired token');
                }
            }
            default: {
                const request = context.switchToHttp().getRequest();
                const authHeader = request?.headers?.authorization?.split(' ')[1];

                if (!authHeader) {
                    return true; // No token, allow the request to proceed
                }

                try {
                    const userDecoded = verify(authHeader, jwtSecret) as UserJwt;
                    if (typeof userDecoded === 'string') {
                        throw new UnauthorizedException('Invalid token format');
                    }

                    // Add validated user to request
                    request.user = userDecoded;
                    return true;
                } catch (error) {
                    throw new UnauthorizedException('Invalid or expired token');
                }
            }
        }
    }
}
