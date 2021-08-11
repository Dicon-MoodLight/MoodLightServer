import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { IStatusResponse } from '../types/response';
import { FAILURE_RESPONSE, SUCCESS_RESPONSE } from '../constants/response';
import { throwHttpException } from '../util/error';
import { JoinDto } from './dto/join.dto';
import { ConfirmDto } from './dto/confirm.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async join({
    email,
    password: plain,
    nickname,
    ...joinDto
  }: JoinDto): Promise<IStatusResponse> {
    try {
      const emailHasUser = await this.userService.findUserByEmail(email);
      const nicknameIsExist = !!(await this.userService.findUserByNickname(
        nickname,
        true,
      ));
      if (emailHasUser?.confirmed || nicknameIsExist) {
        throwHttpException(
          { ...FAILURE_RESPONSE, message: 'User already exists.' },
          HttpStatus.CONFLICT,
        );
      }
      const confirmCode = this.createConfirmCode();
      const password = await this.encryptPassword(plain);
      const user = {
        email,
        nickname,
        password,
        confirmCode,
        admin:
          joinDto?.adminKey === this.configService.get<string>('ADMIN_KEY'),
      };
      if (emailHasUser) {
        await this.userRepository.update(emailHasUser.id, user);
      } else {
        const newUser = await this.userRepository.create(user);
        await this.userRepository.save(newUser);
      }
      await this.sendConfirmEmail(email, confirmCode);
    } catch (err) {
      throwHttpException(FAILURE_RESPONSE, HttpStatus.CONFLICT);
    }
    return SUCCESS_RESPONSE;
  }

  async confirm(confirmDto: ConfirmDto): Promise<IStatusResponse> {
    try {
      const user = await this.userRepository.findOne({
        ...confirmDto,
        confirmed: false,
      });
      if (!user) {
        throwHttpException(
          {
            ...FAILURE_RESPONSE,
            message: 'User does not exists.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.userRepository.update(user.id, { confirmed: true });
    } catch (err) {
      throwHttpException(FAILURE_RESPONSE, HttpStatus.CONFLICT);
    }
    return SUCCESS_RESPONSE;
  }

  async login({ email, password: plain }: LoginDto): Promise<User> {
    const { password } = await this.userRepository.findOne({
      where: { email },
      select: ['password'],
    });
    const isMatch = await bcrypt.compare(plain, password);
    if (isMatch) {
      return await this.userService.findUserByEmail(email);
    }
    throw new UnauthorizedException();
  }

  createJwtAccessToken({ id, email }): string {
    return this.jwtService.sign({ id, email });
  }

  private async encryptPassword(plain: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(plain, salt);
  }

  transporter = nodemailer.createTransport({
    service: this.configService.get<string>('EMAIL_SERVICE'),
    host: this.configService.get<string>('EMAIL_HOST'),
    port: this.configService.get<string>('EMAIL_PORT'),
    auth: {
      user: this.configService.get<string>('EMAIL_ADDRESS'),
      pass: this.configService.get<string>('EMAIL_PASSWORD'),
    },
  } as any);

  private createConfirmCode(): string {
    const CHARS = '0123456789';
    const VERIFY_NUMBER_LENGTH = 6;
    let verifyNumber = '';
    for (let i = 0; i < VERIFY_NUMBER_LENGTH; i++) {
      const n = Math.floor(Math.random() * CHARS.length);
      verifyNumber += CHARS.substring(n, n + 1);
    }
    return verifyNumber;
  }

  private async sendConfirmEmail(email, confirmCode): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_ADDRESS'),
      to: email,
      subject: '[무드등] 이메일 인증이 필요합니다',
      html: `인증번호: ${confirmCode}`,
    });
  }
}
