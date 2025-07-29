import { IsString, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { Type, Expose } from 'class-transformer';

export class CreateOpportunityDto {
  @IsString()
  platform: string;

  @IsString()
  productName: string;

  @IsString()
  productUrl: string;

  @IsString()
  affiliateUrl: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  commissionRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  paymentFrequency?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAffiliate?: boolean;
}

export class UpdateOpportunityDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  productUrl?: string;

  @IsOptional()
  @IsString()
  affiliateUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  commissionRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  paymentFrequency?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  thumbnail?: string;
}

export class OpportunityResponseDto {
  @Expose() id: string;
  @Expose() productName: string;
  @Expose() platform: string;
  @Expose() commissionRate?: number;
  @Expose() price?: number;
  @Expose() category?: string;
  @Expose() lastUsedAt?: Date;
  @Expose() productUrl?: string;
  @Expose() affiliateUrl?: string;
  @Expose() paymentFrequency?: string;
  @Expose() description?: string;
  @Expose() images?: string[];
  @Expose() thumbnail?: string;
}

export class OpportunitiesListDto {
  @Type(() => OpportunityResponseDto)
  opportunities: OpportunityResponseDto[];
}
