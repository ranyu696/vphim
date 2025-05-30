import {
    Controller,
    Req,
    Post,
    Body,
    UseGuards,
    HttpStatus,
    HttpCode,
    SerializeOptions,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiTags, ApiBody, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import {
    AuthLoginPasswordlessDto,
    AuthValidatePasswordlessDto,
    AuthSignupDto,
    LoginResponseDto,
    RefreshTokenDto,
    AuthLoginGoogleDto,
    AuthLoginGithubDto,
} from './dtos';
import { AuthRegisterConfirmDto } from './dtos/auth-register-confirm.dto';
import { UserJwt } from './strategies/types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('register')
    async register(@Body() dto: AuthSignupDto) {
        return this.authService.register(dto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('register/confirm')
    async registerConfirm(@Body() { hash }: AuthRegisterConfirmDto) {
        return this.authService.registerConfirm(hash);
    }

    // @UseGuards(ThrottlerGuard)
    // @Throttle({ 'request-passwordless': { limit: 1, ttl: 1000 * 60 * 3 } })
    @ApiOkResponse({ description: 'Request login passwordless' })
    @ApiTooManyRequestsResponse({ description: 'Too many requests' })
    @HttpCode(HttpStatus.OK)
    @Post('login/pwdless')
    async loginPwdless(@Body() data: AuthLoginPasswordlessDto) {
        return this.authService.requestLoginPwdless(data);
    }

    @ApiOkResponse({ type: LoginResponseDto })
    @Post('login/pwdless/validate')
    validateLoginPwdless(@Body() { hash = '', email }: AuthValidatePasswordlessDto) {
        return this.authService.validateRequestLoginPwdless({ hash, email });
    }

    @ApiOkResponse({ type: LoginResponseDto })
    @HttpCode(HttpStatus.OK)
    @Post('login/google')
    async loginGoogle(@Body() data: AuthLoginGoogleDto) {
        return this.authService.validateLoginGoogle(data);
    }

    @ApiOkResponse({ type: LoginResponseDto })
    @HttpCode(HttpStatus.OK)
    @Post('login/github')
    async loginGithub(@Body() data: AuthLoginGithubDto) {
        return this.authService.validateLoginGithub(data);
    }

    @ApiBody({
        type: RefreshTokenDto,
    })
    @UseGuards(AuthGuard('jwt-refresh'))
    @SerializeOptions({
        groups: ['me'],
    })
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: LoginResponseDto })
    public refresh(@Req() request: { user: UserJwt }): Promise<Omit<LoginResponseDto, 'user'>> {
        return this.authService.refreshToken(request.user);
    }
}
