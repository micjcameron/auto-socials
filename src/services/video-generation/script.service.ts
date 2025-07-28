import { Injectable, Logger } from '@nestjs/common';
import { Opportunity } from '../../entities/opportunity.entity';
import { OpenAIService } from '../generators/openai.service';

@Injectable()
export class ScriptService {
  private readonly logger = new Logger(ScriptService.name);

  constructor(private openaiService: OpenAIService) {}

  async generateScript(
    opportunity: Opportunity,
    style: string = 'static'
  ): Promise<string> {
    try {
      this.logger.log(
        `📝 Generating script for ${opportunity.productName} with style: ${style}`
      );

      const script = await this.openaiService.generateScript(
        opportunity,
        style
      );

      this.logger.log(`✅ Script generated successfully`);
      return script;
    } catch (error) {
      this.logger.error('❌ Failed to generate script:', error);
      throw error;
    }
  }

  async generateCaption(script: string, platform: string): Promise<string> {
    try {
      this.logger.log(`📝 Generating caption for ${platform}`);

      const caption = await this.openaiService.generateCaption(
        script,
        platform
      );

      this.logger.log(`✅ Caption generated for ${platform}`);
      return caption;
    } catch (error) {
      this.logger.error(
        `❌ Failed to generate caption for ${platform}:`,
        error
      );
      return 'Check this out! 🔥'; // Fallback caption
    }
  }

  async generateCaptionsForVideo(
    script: string
  ): Promise<{ [platform: string]: string }> {
    try {
      this.logger.log('📝 Generating captions for all platforms');

      const platforms = ['tiktok', 'instagram', 'youtube', 'telegram'];
      const captions: { [platform: string]: string } = {};

      for (const platform of platforms) {
        captions[platform] = await this.generateCaption(script, platform);
      }

      this.logger.log(
        `✅ Generated captions for ${platforms.length} platforms`
      );
      return captions;
    } catch (error) {
      this.logger.error('❌ Failed to generate captions:', error);
      throw error;
    }
  }
}
