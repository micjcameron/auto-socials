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

  async generateScript(opportunity: any, style: string = 'viral', isAffiliate: boolean = false): Promise<string> {
    try {
      const prompt = this.buildPrompt(opportunity, style, isAffiliate);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: isAffiliate
              ? 'You are a viral video script writer. Create engaging, short-form content that drives action and encourages viewers to click an affiliate link.'
              : 'You are a viral video script writer. Create engaging, short-form, organic content that entertains or informs, but does NOT mention any product or affiliate link.',
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
            content: 'You are a social media expert. Create platform-specific captions.',
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

  async generateOrganicIdeas(prompt: string): Promise<string[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a creative social media strategist. Generate unique, organic video ideas (titles only).',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.9,
      });
      const text = completion.choices[0]?.message?.content || '';
      // Split into lines, filter out empty, trim
      return text
        .split('\n')
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 5);
    } catch (error) {
      this.logger.error('Failed to generate organic ideas:', error);
      return [];
    }
  }

  async generateTextOverlays(script: string, opportunity: any): Promise<string[]> {
    try {
      this.logger.log('Generating AI-powered text overlays...');

      const prompt = `Based on this video script and product information, generate 5 catchy, engaging text overlays to display on the video:

Script: ${script}

Product: ${opportunity.productName}
Price: $${opportunity.price}
Commission: ${opportunity.commissionRate}%
Category: ${opportunity.category}

Requirements:
- Overlay 1: Hook/Problem (2-3 words)
- Overlay 2: Solution/Benefit (3-4 words) 
- Overlay 3: Social Proof/Urgency (2-3 words)
- Overlay 4: Call-to-Action (2-3 words)
- Overlay 5: Scarcity/Deadline (2-3 words)

Make each overlay:
- Highly clickable and conversion-focused
- Match the script's tone and timing
- Use power words: "Exclusive", "Limited", "Guaranteed", "Proven"
- Include emojis strategically: ��🔥⚡🎯
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.9,
      });

      const overlays = response.choices[0].message.content
        ?.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5) || [];

      this.logger.log(`Generated ${overlays.length} text overlays: ${overlays.join(', ')}`);
      return overlays;
    } catch (error) {
      this.logger.error('Failed to generate text overlays:', error);
      // Fallback overlays
      return [
        opportunity.productName?.toUpperCase() || 'AMAZING PRODUCT',
        `SAVE ${opportunity.commissionRate || 50}% TODAY`,
        `ONLY $${opportunity.price || 'XX'}`,
        'CLICK LINK BELOW',
        'LIMITED TIME ONLY'
      ];
    }
  }

  private buildPrompt(opportunity: any, style: string, isAffiliate: boolean): string {
    if (isAffiliate) {
      return `Create a viral video transcript for this product that will be read by a text-to-speech voice.

Product: ${opportunity.productName}
Category: ${opportunity.category}
Description: ${opportunity.description}
Price: $${opportunity.price}
Commission: ${opportunity.commissionRate}%

Style: ${style}

Requirements:
- 15 seconds duration when spoken (keep it concise)
- Hook in first 3 seconds
- Include a strong call-to-action to click the link
- Make it shareable and engaging
- Target audience: social media users interested in ${opportunity.category}
- Write ONLY the spoken words, no timing cues or production notes
- Natural, conversational tone
- Clear and easy to pronounce
- Format the script as short, punchy lines, one per line (not one big paragraph)
- When referring to monetary values, say the amount as spoken currency (e.g., 'five thousand dollars' instead of '$5000')

Example format:
Dreaming of losing those extra pounds effortlessly?
Tired of fad diets and endless workouts with no visible results?
Introducing Weight Loss Miracle Pill, the revolutionary weight loss supplement that guarantees you lose 10 pounds in just 30 days!
Don't wait to start your transformation, click the link to buy now!
If you want to experience life-changing weight loss, share this with your friends who are also on their weight loss journey!

Write ONLY the transcript text that will be spoken, nothing else.`;
    } else {
      return `Create a viral, organic video script for social media. Do NOT mention any product, brand, or affiliate link.

Topic: ${opportunity.category || opportunity.productName}
Description: ${opportunity.description}

Requirements:
- 15 seconds duration when spoken (keep it concise)
- Hook in first 3 seconds
- Entertain, inform, or inspire
- No call-to-action, no product mention
- Make it highly shareable
- Write ONLY the spoken words, no timing cues or production notes
- Natural, conversational tone
- Clear and easy to pronounce
- Format the script as short, punchy lines, one per line (not one big paragraph)
- When referring to monetary values, say the amount as spoken currency (e.g., 'five thousand dollars' instead of '$5000')

Example format:
Did you know that AI can now write poetry?
Imagine a world where your computer helps you brainstorm your next big idea!
Stay curious, and share this with a friend who loves tech!

Write ONLY the transcript text that will be spoken, nothing else.`;
    }
  }
}
