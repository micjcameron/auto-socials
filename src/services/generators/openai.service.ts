import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateScript(
    opportunity: any,
    style: string = 'viral'
  ): Promise<string> {
    try {
      const prompt = this.buildPrompt(opportunity, style);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a viral video script writer. Create engaging, short-form content that drives action.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      const script = completion.choices[0]?.message?.content;
      this.logger.log(`Generated script for ${opportunity.productName}`);

      return script || 'Default script content';
    } catch (error) {
      this.logger.error('Failed to generate script:', error);
      throw error;
    }
  }

  async generateCaption(script: string, platform: string): Promise<string> {
    try {
      const platformPrompts = {
        tiktok: 'Create a viral TikTok caption with relevant hashtags',
        instagram: 'Create an Instagram caption with emojis and hashtags',
        youtube: 'Create a YouTube Shorts title and description',
        telegram: 'Create a concise Telegram post caption',
      };

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a social media expert. Create platform-specific captions.',
          },
          {
            role: 'user',
            content: `${platformPrompts[platform] || platformPrompts.telegram}\n\nScript: ${script}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Check this out! 🔥';
    } catch (error) {
      this.logger.error('Failed to generate caption:', error);
      return 'Check this out! 🔥';
    }
  }

  private buildPrompt(opportunity: any, style: string): string {
    const basePrompt = `
Create a viral video transcript for this product that will be read by a text-to-speech voice:

Product: ${opportunity.productName}
Category: ${opportunity.category}
Description: ${opportunity.description}
Price: $${opportunity.price}
Commission: ${opportunity.commissionRate}%

Style: ${style}

Requirements:
- 15-30 seconds duration when spoken
- Hook in first 3 seconds
- Include call-to-action
- Make it shareable and engaging
- Target audience: social media users interested in ${opportunity.category}
- Write ONLY the spoken words, no timing cues or production notes
- Natural, conversational tone
- Clear and easy to pronounce

Example format:
"Dreaming of losing those extra pounds effortlessly? Tired of fad diets and endless workouts with no visible results? Introducing Weight Loss Miracle Pill, the revolutionary weight loss supplement that guarantees you lose 10 pounds in just 30 days! Don't wait to start your transformation, click the link to buy now! If you want to experience life-changing weight loss, share this with your friends who are also on their weight loss journey!"

Write ONLY the transcript text that will be spoken, nothing else.
`;

    return basePrompt;
  }
}
