import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Opportunity } from '../entities/opportunity.entity';

const logger = new Logger('SeedUtils');

export async function seedDatabase(dataSource: DataSource) {
  logger.log('🌱 Starting database seeding...');

  try {
    // Seed opportunities
    await seedOpportunities(dataSource);

    logger.log('✅ Database seeding completed successfully!');
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    throw error;
  }
}

async function seedOpportunities(dataSource: DataSource) {
  const opportunityRepository = dataSource.getRepository(Opportunity);

  // Check if opportunities already exist
  const existingCount = await opportunityRepository.count();
  if (existingCount > 0) {
    logger.log(`⚠️  ${existingCount} opportunities already exist, skipping seeding`);
    return;
  }

  const opportunities = [
    {
      platform: 'clickbank',
      productName: 'Weight Loss Miracle Pill',
      productUrl: 'https://example.com/weight-loss-pill',
      affiliateUrl: 'https://example.com/affiliate/weight-loss-pill',
      commissionRate: 75.0,
      price: 49.99,
      category: 'health',
      description: 'Revolutionary weight loss supplement that helps you lose 10 pounds in 30 days!',
      trendingScore: 0.95,
    },
    {
      platform: 'whop',
      productName: 'AI Content Creator Pro',
      productUrl: 'https://example.com/ai-content-creator',
      affiliateUrl: 'https://example.com/affiliate/ai-content-creator',
      commissionRate: 50.0,
      price: 29.99,
      category: 'software',
      description: 'Create viral content in seconds with our AI-powered content generator!',
      trendingScore: 0.88,
    },
    {
      platform: 'clickbank',
      productName: 'Crypto Trading Masterclass',
      productUrl: 'https://example.com/crypto-masterclass',
      affiliateUrl: 'https://example.com/affiliate/crypto-masterclass',
      commissionRate: 60.0,
      price: 199.99,
      category: 'finance',
      description: 'Learn how to make $1000+ daily with cryptocurrency trading strategies!',
      trendingScore: 0.92,
    },
    {
      platform: 'whop',
      productName: 'Social Media Growth Hack',
      productUrl: 'https://example.com/social-growth-hack',
      affiliateUrl: 'https://example.com/affiliate/social-growth-hack',
      commissionRate: 40.0,
      price: 79.99,
      category: 'marketing',
      description: 'Grow your social media following from 0 to 100k in 90 days!',
      trendingScore: 0.87,
    },
    {
      platform: 'clickbank',
      productName: 'Relationship Coach Certification',
      productUrl: 'https://example.com/relationship-coach',
      affiliateUrl: 'https://example.com/affiliate/relationship-coach',
      commissionRate: 80.0,
      price: 299.99,
      category: 'education',
      description: 'Become a certified relationship coach and help couples save their marriages!',
      trendingScore: 0.89,
    },
  ];

  logger.log(`🌱 Seeding ${opportunities.length} opportunities...`);

  for (const opportunityData of opportunities) {
    const opportunity = opportunityRepository.create(opportunityData);
    await opportunityRepository.save(opportunity);
    logger.log(`✅ Seeded opportunity: ${opportunity.productName}`);
  }

  logger.log(`🎉 Successfully seeded ${opportunities.length} opportunities!`);
}
