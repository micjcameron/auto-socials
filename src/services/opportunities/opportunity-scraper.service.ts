import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhopApiService } from '../../api/whop.api';
import { ClickBankApiService } from '../../api/clickbank.api';
import { WebScraperService } from './web-scraper.service';
import { Opportunity } from '../../entities/opportunity.entity';
import { OpportunitiesService } from '../opportunities/opportunities.service';

@Injectable()
export class OpportunityScraperService {
  private readonly logger = new Logger(OpportunityScraperService.name);

  constructor(
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
    private whopApiService: WhopApiService,
    private clickBankApiService: ClickBankApiService,
    private webScraperService: WebScraperService,
    private opportunitiesService: OpportunitiesService
  ) {}

  async scrapeWhopOpportunities(): Promise<Opportunity[]> {
    try {
      this.logger.log('Scraping opportunities from Whop...');

      const whopProducts = await this.whopApiService.getTrendingProducts(20);
      const opportunities: Opportunity[] = [];

      for (const product of whopProducts) {
        try {
          // Check if opportunity already exists
          const existing = await this.opportunityRepository.findOne({
            where: { productUrl: product.url },
          });

          if (existing) {
            this.logger.debug(`Opportunity already exists: ${product.name}`);
            continue;
          }

          // Get images from API or web scraping
          let images = product.images || [];
          let thumbnail = product.thumbnail || product.images?.[0] || null;

          // If no images from API, try web scraping
          if (!images.length && product.url) {
            try {
              const scrapedImages = await this.webScraperService.extractProductImages(product.url);
              images = scrapedImages;
              thumbnail = scrapedImages.length > 0 ? scrapedImages[0] : null;
              this.logger.log(`🔍 Scraped ${images.length} images for ${product.name}`);
            } catch (error) {
              this.logger.warn(`⚠️ Failed to scrape images for ${product.name}:`, error);
            }
          }

          // Create new opportunity
          const opportunity = this.opportunityRepository.create({
            platform: 'whop',
            productName: product.name,
            productUrl: product.url,
            affiliateUrl: await this.whopApiService.getAffiliateLink(
              product.id
            ),
            commissionRate: product.commission_rate,
            price: product.price,
            category: product.category,
            description: product.description,
            trendingScore: product.trending_score,
            images: images,
            thumbnail: thumbnail,
            isAffiliate: true,
          });

          const savedOpportunity = await this.opportunityRepository.save(opportunity);
          opportunities.push(savedOpportunity);

          // Generate and store 5 organic ideas for this affiliate opportunity
          await this.opportunitiesService.generateOrganicIdeas(product.name, product.description);

          this.logger.log(`Saved Whop opportunity: ${product.name}`);
        } catch (error) {
          this.logger.error(`Failed to process Whop product ${product.name}:`, error);
        }
      }

      this.logger.log(`Scraped ${opportunities.length} new opportunities from Whop`);
      return opportunities;
    } catch (error) {
      this.logger.error('Failed to scrape Whop opportunities:', error);
      throw error;
    }
  }

  async scrapeClickBankOpportunities(): Promise<Opportunity[]> {
    try {
      this.logger.log('Scraping opportunities from ClickBank...');

      const clickBankProducts = await this.clickBankApiService.getPopularProducts(20);
      const opportunities: Opportunity[] = [];

      for (const product of clickBankProducts) {
        try {
          // Check if opportunity already exists
          const existing = await this.opportunityRepository.findOne({
            where: { productUrl: product.url },
          });

          if (existing) {
            this.logger.debug(`Opportunity already exists: ${product.name}`);
            continue;
          }

          // Create new opportunity
          const opportunity = this.opportunityRepository.create({
            platform: 'clickbank',
            productName: product.name,
            productUrl: product.url,
            affiliateUrl: product.url, // ClickBank URL already includes affiliate ID
            commissionRate: product.commission_rate,
            price: product.price,
            category: product.category,
            description: product.description,
            trendingScore: product.gravity / 100, // Normalize gravity to 0-1 scale
          });

          const savedOpportunity = await this.opportunityRepository.save(opportunity);
          opportunities.push(savedOpportunity);

          this.logger.log(`Saved ClickBank opportunity: ${product.name}`);
        } catch (error) {
          this.logger.error(`Failed to process ClickBank product ${product.name}:`, error);
        }
      }

      this.logger.log(`Scraped ${opportunities.length} new opportunities from ClickBank`);
      return opportunities;
    } catch (error) {
      this.logger.error('Failed to scrape ClickBank opportunities:', error);
      throw error;
    }
  }

  async scrapeAllOpportunities(): Promise<Opportunity[]> {
    try {
      this.logger.log('Starting comprehensive opportunity scraping...');

      const [whopOpportunities, clickBankOpportunities] = await Promise.allSettled([
        this.scrapeWhopOpportunities(),
        this.scrapeClickBankOpportunities(),
      ]);

      const allOpportunities: Opportunity[] = [];

      if (whopOpportunities.status === 'fulfilled') {
        allOpportunities.push(...whopOpportunities.value);
      } else {
        this.logger.error('Whop scraping failed:', whopOpportunities.reason);
      }

      if (clickBankOpportunities.status === 'fulfilled') {
        allOpportunities.push(...clickBankOpportunities.value);
      } else {
        this.logger.error('ClickBank scraping failed:', clickBankOpportunities.reason);
      }

      this.logger.log(`Total opportunities scraped: ${allOpportunities.length}`);
      return allOpportunities;
    } catch (error) {
      this.logger.error('Failed to scrape all opportunities:', error);
      throw error;
    }
  }
}
