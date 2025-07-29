import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CompositionService } from './composition.service';
import { SCHEDULES } from '../config/schedule.constants';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private compositionService: CompositionService) {}

  // TikTok Affiliate - once a day at 6pm
  @Cron(SCHEDULES.tiktok.affiliate)
  async postTikTokAffiliate() {
    this.logger.log('🕕 TikTok affiliate posting scheduled');
    await this.compositionService.generateAndPost('tiktok', 1, true);
  }

  // TikTok Non-Affiliate - 4 times a day at 7am, 12pm, 5pm, 9pm
  @Cron(SCHEDULES.tiktok.nonAffiliate)
  async postTikTokOrganic() {
    this.logger.log('🕖 TikTok organic posting scheduled');
    await this.compositionService.generateAndPost('tiktok', 1, false);
  }

  // Instagram Affiliate - once a day at 6pm
  @Cron(SCHEDULES.instagram.affiliate)
  async postInstagramAffiliate() {
    this.logger.log('🕕 Instagram affiliate posting scheduled');
    await this.compositionService.generateAndPost('instagram', 1, true);
  }

  // Instagram Non-Affiliate - 4 times a day
  @Cron(SCHEDULES.instagram.nonAffiliate)
  async postInstagramOrganic() {
    this.logger.log('🕖 Instagram organic posting scheduled');
    await this.compositionService.generateAndPost('instagram', 1, false);
  }

  // YouTube Affiliate - once a day at 6pm
  @Cron(SCHEDULES.youtube.affiliate)
  async postYouTubeAffiliate() {
    this.logger.log('🕕 YouTube affiliate posting scheduled');
    await this.compositionService.generateAndPost('youtube', 1, true);
  }

  // YouTube Non-Affiliate - 4 times a day
  @Cron(SCHEDULES.youtube.nonAffiliate)
  async postYouTubeOrganic() {
    this.logger.log('🕖 YouTube organic posting scheduled');
    await this.compositionService.generateAndPost('youtube', 1, false);
  }

  // Telegram Affiliate - once a day at 6pm
  @Cron(SCHEDULES.telegram.affiliate)
  async postTelegramAffiliate() {
    this.logger.log('🕕 Telegram affiliate posting scheduled');
    await this.compositionService.generateAndPost('telegram', 1, true);
  }

  // Telegram Non-Affiliate - 4 times a day
  @Cron(SCHEDULES.telegram.nonAffiliate)
  async postTelegramOrganic() {
    this.logger.log('🕖 Telegram organic posting scheduled');
    await this.compositionService.generateAndPost('telegram', 1, false);
  }

  // Twitter Affiliate - once a day at 6pm
  @Cron(SCHEDULES.twitter.affiliate)
  async postTwitterAffiliate() {
    this.logger.log('🕕 Twitter affiliate posting scheduled');
    await this.compositionService.generateAndPost('twitter', 1, true);
  }

  // Twitter Non-Affiliate - 4 times a day
  @Cron(SCHEDULES.twitter.nonAffiliate)
  async postTwitterOrganic() {
    this.logger.log('🕖 Twitter organic posting scheduled');
    await this.compositionService.generateAndPost('twitter', 1, false);
  }

  // Get current schedule configuration
  getScheduleConfig() {
    return {
      tiktok: {
        affiliate: {
          frequency: '1x daily',
          times: ['6:00 PM'],
          cron: SCHEDULES.tiktok.affiliate,
        },
        nonAffiliate: {
          frequency: '4x daily',
          times: ['7:00 AM', '12:00 PM', '5:00 PM', '9:00 PM'],
          cron: SCHEDULES.tiktok.nonAffiliate,
        },
      },
      instagram: {
        affiliate: {
          frequency: '1x daily',
          times: ['6:00 PM'],
          cron: SCHEDULES.instagram.affiliate,
        },
        nonAffiliate: {
          frequency: '4x daily',
          times: ['7:00 AM', '12:00 PM', '5:00 PM', '9:00 PM'],
          cron: SCHEDULES.instagram.nonAffiliate,
        },
      },
      youtube: {
        affiliate: {
          frequency: '1x daily',
          times: ['6:00 PM'],
          cron: SCHEDULES.youtube.affiliate,
        },
        nonAffiliate: {
          frequency: '4x daily',
          times: ['7:00 AM', '12:00 PM', '5:00 PM', '9:00 PM'],
          cron: SCHEDULES.youtube.nonAffiliate,
        },
      },
      telegram: {
        affiliate: {
          frequency: '1x daily',
          times: ['6:00 PM'],
          cron: SCHEDULES.telegram.affiliate,
        },
        nonAffiliate: {
          frequency: '4x daily',
          times: ['7:00 AM', '12:00 PM', '5:00 PM', '9:00 PM'],
          cron: SCHEDULES.telegram.nonAffiliate,
        },
      },
      twitter: {
        affiliate: {
          frequency: '1x daily',
          times: ['6:00 PM'],
          cron: SCHEDULES.twitter.affiliate,
        },
        nonAffiliate: {
          frequency: '4x daily',
          times: ['7:00 AM', '12:00 PM', '5:00 PM', '9:00 PM'],
          cron: SCHEDULES.twitter.nonAffiliate,
        },
      },
    };
  }
}
