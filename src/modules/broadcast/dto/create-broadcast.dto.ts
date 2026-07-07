import { IsNotEmpty, IsString, IsOptional, IsArray, IsIn } from 'class-validator';

export class CreateBroadcastDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  @IsIn(['image', 'video'])
  mediaType?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsArray()
  inlineButtons?: Array<{ text: string; url: string }>;

  @IsNotEmpty()
  @IsString()
  @IsIn(['all', 'connected', 'active'])
  targetFilter: string;
}
