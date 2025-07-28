import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OpportunitiesService } from './opportunities/opportunities.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private opportunitiesService: OpportunitiesService) {}

  // TikTok Schedule - 3 videos per day
  @Cron('0 9,14,19 * * *') // 9 AM, 2 PM, 7 PM
  async postToTikTok() {
    this.logger.log('🕐 TikTok posting scheduled');
    await this.generateAndPost('tiktok', 1);
  }

  // Instagram Schedule - 2 videos per day
  @Cron('0 10,17 * * *') // 10 AM, 5 PM
  async postToInstagram() {
    this.logger.log('🕐 Instagram posting scheduled');
    await this.generateAndPost('instagram', 1);
  }

  // YouTube Schedule - 1 video per day
  @Cron('0 15 * * *') // 3 PM
  async postToYouTube() {
    this.logger.log('🕐 YouTube posting scheduled');
    await this.generateAndPost('youtube', 1);
  }

  // Telegram Schedule - 4 videos per day
  @Cron('0 8,12,16,20 * * *') // 8 AM, 12 PM, 4 PM, 8 PM
  async postToTelegram() {
    this.logger.log('🕐 Telegram posting scheduled');
    await this.generateAndPost('telegram', 1);
  }

  // Twitter/X Schedule - 3 videos per day
  @Cron('0 11,15,18 * * *') // 11 AM, 3 PM, 6 PM
  async postToTwitter() {
    this.logger.log('🕐 Twitter posting scheduled');
    await this.generateAndPost('twitter', 1);
  }

  // Manual override methods for testing
  async generateAndPost(platform: string, count: number = 1) {
    try {
      this.logger.log(`🎬 Generating ${count} video(s) for ${platform}`);

      // Get opportunities for video generation
      const response =
        await this.opportunitiesService.getAllOpportunities(count);

      if (!response.success || !response.opportunities) {
        this.logger.error(
          `❌ Failed to get opportunities for ${platform}:`,
          response.error
        );
        return;
      }

      for (const opportunity of response.opportunities) {
        try {
          // Generate video (80% organic, 20% affiliate logic here)
          const isAffiliateVideo = Math.random() < 0.2; // 20% chance

          if (isAffiliateVideo) {
            this.logger.log(`💰 Generating affiliate video for ${platform}`);
            await this.opportunitiesService.generateVideoFromOpportunity(
              opportunity.id
            );
          } else {
            this.logger.log(`🎯 Generating organic video for ${platform}`);
            // Generate organic content (no affiliate links)
            await this.generateOrganicVideo(opportunity.id);
          }

          // TODO: Add distribution logic here
          this.logger.log(`✅ Video generated and posted to ${platform}`);
        } catch (error) {
          this.logger.error(
            `❌ Failed to generate video for ${platform}:`,
            error
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to generate and post to ${platform}:`,
        error
      );
    }
  }

  private async generateOrganicVideo(opportunityId: string) {
    // Generate organic content (facts, tips, etc.) without affiliate links
    this.logger.log('🎯 Generating organic content...');
    // TODO: Implement organic content generation
    await this.opportunitiesService.generateVideoFromOpportunity(opportunityId);
  }

  // Manual trigger methods for testing
  async triggerTikTokPost() {
    await this.generateAndPost('tiktok', 1);
  }

  async triggerInstagramPost() {
    await this.generateAndPost('instagram', 1);
  }

  async triggerYouTubePost() {
    await this.generateAndPost('youtube', 1);
  }

  async triggerTelegramPost() {
    await this.generateAndPost('telegram', 1);
  }

  async triggerTwitterPost() {
    await this.generateAndPost('twitter', 1);
  }

  // Get current schedule configuration
  getScheduleConfig() {
    return {
      tiktok: {
        frequency: '3x daily',
        times: ['9:00 AM', '2:00 PM', '7:00 PM'],
        cron: '0 9,14,19 * * *',
      },
      instagram: {
        frequency: '2x daily',
        times: ['10:00 AM', '5:00 PM'],
        cron: '0 10,17 * * *',
      },
      youtube: {
        frequency: '1x daily',
        times: ['3:00 PM'],
        cron: '0 15 * * *',
      },
      telegram: {
        frequency: '4x daily',
        times: ['8:00 AM', '12:00 PM', '4:00 PM', '8:00 PM'],
        cron: '0 8,12,16,20 * * *',
      },
      twitter: {
        frequency: '3x daily',
        times: ['11:00 AM', '3:00 PM', '6:00 PM'],
        cron: '0 11,15,18 * * *',
      },
    };
  }
}
