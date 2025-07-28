import { Injectable, Logger } from '@nestjs/common';
import { OpportunitiesRepository } from '../repositories/opportunities.repository';
import { VideoGenerationService } from './video-generation/video-generation.service';

@Injectable()
export class OpportunitiesService {
  private readonly logger = new Logger(OpportunitiesService.name);

  constructor(
    private opportunitiesRepository: OpportunitiesRepository,
    private videoGenerationService: VideoGenerationService
  ) {}

  async getAllOpportunities(limit: number = 10) {
    try {
      const opportunities = await this.opportunitiesRepository.findAll(limit);
      return {
        success: true,
        message: `Found ${opportunities.length} opportunities`,
        opportunities: opportunities.map(opp => ({
          id: opp.id,
          productName: opp.productName,
          platform: opp.platform,
          commissionRate: opp.commissionRate,
          price: opp.price,
          category: opp.category,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to get opportunities:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generateScriptFromOpportunity(opportunityId: string) {
    try {
      const opportunity =
        await this.opportunitiesRepository.findById(opportunityId);

      if (!opportunity) {
        return {
          success: false,
          error: `Opportunity not found: ${opportunityId}`,
        };
      }

      // Generate script using OpenAI
      const script =
        await this.videoGenerationService.generateVideoFromOpportunity(
          opportunityId,
          'static'
        );

      return {
        success: true,
        message: 'Script generated successfully',
        opportunity: {
          id: opportunity.id,
          productName: opportunity.productName,
          platform: opportunity.platform,
        },
        script,
      };
    } catch (error) {
      this.logger.error('Failed to generate script:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generateVideoFromOpportunity(opportunityId: string) {
    try {
      const video =
        await this.videoGenerationService.generateVideoFromOpportunity(
          opportunityId
        );
      return {
        success: true,
        message: 'Video generated successfully',
        video: {
          id: video.id,
          title: video.title,
          status: video.status,
        },
      };
    } catch (error) {
      this.logger.error('Failed to generate video:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
