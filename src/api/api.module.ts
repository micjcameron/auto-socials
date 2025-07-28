import { Module } from '@nestjs/common';
import { WhopApiService } from './whop.api';
import { ClickBankApiService } from './clickbank.api';
import { TikTokApiService } from './tiktok.api';
import { YouTubeApiService } from './youtube.api';

@Module({
  providers: [
    WhopApiService,
    ClickBankApiService,
    TikTokApiService,
    YouTubeApiService,
  ],
  exports: [
    WhopApiService,
    ClickBankApiService,
    TikTokApiService,
    YouTubeApiService,
  ],
})
export class ApiModule {}
