import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { AuthService } from './auth.service';
import { StatusResponse } from '../types/response';
import { StatusResponseDto } from '../constants/response';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { ILoginResponse } from './interface/response';
import {
  JoinDto,
  ConfirmChangePasswordNotLoggedInDto,
  ConfirmDto,
  ChangePasswordDto,
  SaveFirebaseTokenOfUserDto,
} from './dto';
import { UserEmailDto } from '../user/dto/user-email.dto';
import { User } from '../user/entity/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '자신의 사용자 정보 가져오기' })
  @ApiResponse({ type: User })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async authorization(@Req() req: any): Promise<User> {
    return req.user;
  }

  @ApiOperation({ summary: '가입 요청' })
  @ApiBody({ type: JoinDto })
  @ApiResponse({ type: StatusResponseDto })
  @Post('join')
  async join(@Body() joinDto: JoinDto): Promise<StatusResponse> {
    return await this.authService.join(joinDto);
  }

  @ApiOperation({ summary: '가입 인증' })
  @ApiBody({ type: ConfirmDto })
  @ApiResponse({ type: StatusResponseDto })
  @Post('confirm')
  async confirm(@Body() confirmDto: ConfirmDto): Promise<StatusResponse> {
    return await this.authService.confirm(confirmDto);
  }

  @ApiOperation({ summary: '인증번호 확인' })
  @ApiBody({ type: ConfirmDto })
  @ApiResponse({ type: StatusResponseDto })
  @Post('confirm-check')
  async checkConfirmCode(
    @Body() confirmDto: ConfirmDto,
  ): Promise<StatusResponse> {
    return await this.authService.checkConfirmCode(confirmDto);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: SaveFirebaseTokenOfUserDto })
  @ApiOkResponse({ description: '{ accessToken: string; }' })
  @ApiUnauthorizedResponse({ type: StatusResponseDto })
  @ApiBearerAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: any,
    @Body() { firebaseToken }: SaveFirebaseTokenOfUserDto,
  ): Promise<ILoginResponse> {
    const { id, email } = req.user;
    await this.authService.saveFirebaseTokenOfUser(id, firebaseToken);
    const accessToken = this.authService.createJwtAccessToken({ id, email });
    return { accessToken };
  }

  @ApiOperation({
    summary: '비밀번호 변경',
    description: '로그인 상태에서의 비밀번호 변경을 의미합니다.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ type: StatusResponseDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<StatusResponse> {
    const { id: userId } = req.user;
    return await this.authService.changePassword({
      ...changePasswordDto,
      userId,
    });
  }

  @ApiOperation({ summary: '비밀번호 찾기' })
  @ApiBody({ type: UserEmailDto })
  @ApiResponse({ type: StatusResponseDto })
  @Post('find-password')
  async findPassword(@Body() { email }: UserEmailDto): Promise<StatusResponse> {
    return await this.authService.changePasswordNotLoggedIn(email);
  }

  @ApiOperation({ summary: '비밀번호 찾기 인증' })
  @ApiBody({ type: ConfirmChangePasswordNotLoggedInDto })
  @ApiResponse({ type: StatusResponseDto })
  @Post('confirm-find-password')
  async confirmFindPassword(
    @Body()
    confirmChangePasswordNotLoggedInDto: ConfirmChangePasswordNotLoggedInDto,
  ): Promise<StatusResponse> {
    return await this.authService.confirmChangePasswordNotLoggedIn(
      confirmChangePasswordNotLoggedInDto,
    );
  }
}
