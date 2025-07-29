// Cron schedule constants for all platforms
// Update these values to change schedule everywhere (controllers, decorators, config)

export const SCHEDULES = {
  // TikTok schedules
  tiktok: {
    // Once a day at 6:00 PM
    affiliate: '0 18 * * *',
    // Four times a day at 7:00 AM, 12:00 PM, 5:00 PM, 9:00 PM
    nonAffiliate: '0 7,12,17,21 * * *',
  },
  // Instagram schedules
  instagram: {
    affiliate: '0 18 * * *',
    nonAffiliate: '0 7,12,17,21 * * *',
  },
  // YouTube schedules
  youtube: {
    affiliate: '0 18 * * *',
    nonAffiliate: '0 7,12,17,21 * * *',
  },
  // Telegram schedules
  telegram: {
    affiliate: '0 18 * * *',
    nonAffiliate: '0 7,12,17,21 * * *',
  },
  // Twitter schedules
  twitter: {
    affiliate: '0 18 * * *',
    nonAffiliate: '0 7,12,17,21 * * *',
  },
}; 