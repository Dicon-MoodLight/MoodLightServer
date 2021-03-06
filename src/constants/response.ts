import {
  exceptionMessageList,
  ExceptionMessage,
  StatusResponse,
} from '../types/response';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const SUCCESS_RESPONSE: StatusResponse = {
  success: true,
};

export const FAILURE_RESPONSE: StatusResponse = {
  success: false,
  message: 'error',
};

export class StatusResponseDto {
  @ApiProperty({ description: '성공 여부' })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    description: `에러 메세지 (실패할 경우)\n\n [${exceptionMessageList}]`,
  })
  @IsString()
  @IsOptional()
  message: ExceptionMessage;
}

export class ExistResponseDto {
  @ApiProperty({ description: '존재 여부' })
  @IsBoolean()
  exist: boolean;
}
