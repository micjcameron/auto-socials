import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { OpportunityScraperService } from './services/opportunities/opportunity-scraper.service';
import { OpportunitiesService } from './services/opportunities/opportunities.service';
import { VideoGenerationService } from './services/video-generation/video-generation.service';
import { SchedulerService } from './services/scheduler.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly opportunityScraper: OpportunityScraperService,
    private readonly opportunitiesService: OpportunitiesService,
    private readonly videoGenerationService: VideoGenerationService,
    private readonly schedulerService: SchedulerService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Post('test/scrape')
  async testScrape() {
    try {
      const opportunities =
        await this.opportunityScraper.scrapeAllOpportunities();
      return {
        success: true,
        message: `Scraped ${opportunities.length} opportunities`,
        opportunities: opportunities.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('test/n8n')
  testN8n() {
    try {
      console.log('test n8n');
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('test/generate')
  async testGenerate() {
    try {
      const videos = await this.videoGenerationService.generateDailyVideos(1);
      return {
        success: true,
        message: `Generated ${videos.length} videos`,
        videos: videos.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('test/generate/:opportunityId')
  async testGenerateFromOpportunity(
    @Param('opportunityId') opportunityId: string
  ) {
    return this.opportunitiesService.generateVideoFromOpportunity(
      opportunityId
    );
  }

  @Post('test/generate-script/:opportunityId')
  async testGenerateScript(@Param('opportunityId') opportunityId: string) {
    return this.opportunitiesService.generateScriptFromOpportunity(
      opportunityId
    );
  }

  @Get('test/opportunities')
  async getOpportunities() {
    return this.opportunitiesService.getAllOpportunities(10);
  }

  // Scheduler endpoints
  @Get('scheduler/config')
  getScheduleConfig() {
    return this.schedulerService.getScheduleConfig();
  }

  @Post('scheduler/trigger/tiktok')
  async triggerTikTok() {
    return this.schedulerService.triggerTikTokPost();
  }

  @Post('scheduler/trigger/instagram')
  async triggerInstagram() {
    return this.schedulerService.triggerInstagramPost();
  }

  @Post('scheduler/trigger/youtube')
  async triggerYouTube() {
    return this.schedulerService.triggerYouTubePost();
  }

  @Post('scheduler/trigger/telegram')
  async triggerTelegram() {
    return this.schedulerService.triggerTelegramPost();
  }

  @Post('scheduler/trigger/twitter')
  async triggerTwitter() {
    return this.schedulerService.triggerTwitterPost();
  }
}
