import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

import { getTypeOrmConfig } from './database/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { Opportunity } from './entities/opportunity.entity';
import { Video } from './entities/video.entity';
import { Post } from './entities/post.entity';
import { Analytics } from './entities/analytics.entity';
import { AffiliateEarnings } from './entities/affiliate-earnings.entity';

// Repositories
import { OpportunitiesRepository } from './repositories/opportunities.repository';

// Services
import { OpportunitiesService } from './services/opportunities/opportunities.service';
import { SchedulerService } from './services/scheduler.service';

// Video Generation Services
import { VideoGenerationService } from './services/video-generation/video-generation.service';
import { ScriptService } from './services/video-generation/script.service';
import { AudioService } from './services/video-generation/audio.service';
import { VisualService } from './services/video-generation/visual.service';
import { CompositionService } from './services/video-generation/composition.service';

// Generators
import { OpenAIService } from './services/generators/openai.service';
import { ElevenLabsService } from './services/generators/elevenlabs.service';

// Scrapers
import { OpportunityScraperService } from './services/opportunities/opportunity-scraper.service';

// API Services
import { WhopApiService } from './api/whop.api';
import { ClickBankApiService } from './api/clickbank.api';
import { TikTokApiService } from './api/tiktok.api';
import { YouTubeApiService } from './api/youtube.api';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    TypeOrmModule.forFeature([
      Opportunity,
      Video,
      Post,
      Analytics,
      AffiliateEarnings,
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    // Core Services
    AppService,
    OpportunitiesRepository,
    OpportunitiesService,
    SchedulerService,

    // Video Generation Services
    VideoGenerationService,
    ScriptService,
    AudioService,
    VisualService,
    CompositionService,

    // Generators
    OpenAIService,
    ElevenLabsService,

    // Scrapers
    OpportunityScraperService,

    // API Services
    WhopApiService,
    ClickBankApiService,
    TikTokApiService,
    YouTubeApiService,
  ],
})
export class AppModule {}
