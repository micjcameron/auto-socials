import { Injectable, Logger } from '@nestjs/common';
import { OpportunitiesRepository } from '../../repositories/opportunities.repository';
import { Opportunity } from '../../entities/opportunity.entity';
import { DeepPartial } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { OpportunityResponseDto } from '../../dtos/opportunity.dto';
import { OpenAIService } from '../generators/openai.service';
import { ScriptService } from '../video-generation/script.service';

@Injectable()
export class OpportunitiesService {
  private readonly logger = new Logger(OpportunitiesService.name);

  constructor(
    private opportunitiesRepository: OpportunitiesRepository,
    private openaiService: OpenAIService,
    private scriptService: ScriptService,
  ) {}

  async getAllOpportunities(limit: number = 10): Promise<OpportunityResponseDto[]> {
    try {
      const opportunities = await this.opportunitiesRepository.findAll(limit);
      return plainToInstance(OpportunityResponseDto, opportunities, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error('Failed to get opportunities:', error);
      throw error;
    }
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    return this.opportunitiesRepository.findById(id);
  }

  async createOpportunity(data: DeepPartial<Opportunity>): Promise<Opportunity> {
    if (!Array.isArray(data.images)) data.images = [];
    const opportunity = this.opportunitiesRepository.create(data);
    return this.opportunitiesRepository.save(opportunity);
  }

  async updateOpportunity(id: string, data: DeepPartial<Opportunity>): Promise<Opportunity | null> {
    const opportunity = await this.opportunitiesRepository.findById(id);
    if (!opportunity) return null;
    if (!Array.isArray(data.images)) data.images = [];
    Object.assign(opportunity, data);
    return this.opportunitiesRepository.save(opportunity);
  }

  async deleteOpportunity(id: string): Promise<{ deleted: boolean }> {
    const result = await this.opportunitiesRepository.delete(id);
    return { deleted: !!result.affected };
  }

  async generateScriptFromOpportunity(opportunityId: string) {
    try {
      const opportunity = await this.opportunitiesRepository.findById(opportunityId);

      if (!opportunity) {
        return {
          success: false,
          error: `Opportunity not found: ${opportunityId}`,
        };
      }

      // Generate script using OpenAI
      const script = await this.scriptService.generateScript(opportunity, 'static', false);

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

  async markOpportunityAsUsed(opportunityId: string) {
    const opportunity = await this.opportunitiesRepository.findById(opportunityId);
    if (opportunity) {
      opportunity.lastUsedAt = new Date();
      await this.opportunitiesRepository.save(opportunity);
    }
  }

  async getRandomAffiliateOpportunity(): Promise<Opportunity | null> {
    return this.opportunitiesRepository.getRandomAffiliateOpportunity();
  }

  async getRandomOrganicOpportunity(): Promise<Opportunity | null> {
    return this.opportunitiesRepository.getRandomOrganicOpportunity();
  }

  async generateOrganicIdeas(title: string, description: string): Promise<Opportunity[]> {
    this.logger.log(`🤖 Generating organic ideas for: ${title}`);
    const prompt = `Generate 5 unique, organic, non-affiliate video ideas (titles only) related to the following product. Do NOT mention the product name or affiliate links.\nProduct Title: ${title}\nProduct Description: ${description}`;
    const ideas = await this.openaiService.generateOrganicIdeas(prompt);
    const created: Opportunity[] = [];
    for (const idea of ideas) {
      const organic = this.opportunitiesRepository.create({
        productName: idea,
        description: '',
        isAffiliate: false,
      });
      created.push(await this.opportunitiesRepository.save(organic));
    }
    return created;
  }
}
