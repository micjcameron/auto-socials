import { Injectable, Logger } from '@nestjs/common';
import { Opportunity } from '../../entities/opportunity.entity';
import { WebScraperService } from '../opportunities/web-scraper.service';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';

export interface VisualAssets {
  backgroundPath: string;
  images: string[];
  textOverlays: string[];
  effects: string[];
}

@Injectable()
export class VisualService {
  private readonly logger = new Logger(VisualService.name);

  constructor(private webScraperService: WebScraperService) {}

  async generateVisuals(opportunity: Opportunity, style: string = 'static'): Promise<VisualAssets> {
    try {
      this.logger.log(`🎨 Generating visuals for ${opportunity.productName} with style: ${style}`);

      // Download images to local temp files
      const imageUrls = this.fetchImages(opportunity);
      const localImagePaths = await this.downloadImagesToTemp(imageUrls);

      const visualAssets: VisualAssets = {
        backgroundPath: await this.generateBackground(style),
        images: localImagePaths,
        textOverlays: await this.generateTextOverlays(opportunity),
        effects: await this.generateEffects(),
      };

      this.logger.log(`✅ Visuals generated successfully`);
      return visualAssets;
    } catch (error) {
      this.logger.error('❌ Failed to generate visuals:', error);
      throw error;
    }
  }

  // Fetch images for the video: prefer images array, then thumbnail, then default
  fetchImages(opportunity: Opportunity): string[] {
    this.logger.log(`🖼️ Fetching images for opportunity: ${opportunity.productName}`);
    this.logger.log(`🖼️ Opportunity images array: ${JSON.stringify(opportunity.images)}`);
    this.logger.log(`🖼️ Opportunity thumbnail: ${opportunity.thumbnail}`);
    
    if (Array.isArray(opportunity.images) && opportunity.images.length > 0) {
      this.logger.log(`✅ Using ${opportunity.images.length} images from images array`);
      return opportunity.images;
    }
    if (opportunity.thumbnail) {
      this.logger.log(`✅ Using thumbnail as fallback: ${opportunity.thumbnail}`);
      return [opportunity.thumbnail];
    }
    // TODO: Optionally use OpenAI to generate images if both are missing
    this.logger.warn('⚠️ No images or thumbnail found, using default image.');
    return ['/assets/images/default.jpg'];
  }

  // Download all images to /tmp/auto-socials-images and return local file paths
  async downloadImagesToTemp(imageUrls: string[]): Promise<string[]> {
    this.logger.log(`📥 Starting download of ${imageUrls.length} images to temp directory`);
    const tempDir = '/tmp/auto-socials-images';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      this.logger.log(`📁 Created temp directory: ${tempDir}`);
    } else {
      this.logger.log(`📁 Using existing temp directory: ${tempDir}`);
    }
    
    const localPaths: string[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      this.logger.log(`📥 Downloading image ${i + 1}/${imageUrls.length}: ${url}`);
      
      const ext = path.extname(url).split('?')[0] || '.jpg';
      let localPath = path.join(tempDir, `img_${Date.now()}_${i}${ext}`);
      
      try {
        this.logger.log(`📥 Attempting to download to: ${localPath}`);
        await this.webScraperService.downloadImage(url, localPath);
        
        // Check if file was created and has content
        if (fs.existsSync(localPath)) {
          const stats = fs.statSync(localPath);
          this.logger.log(`✅ Downloaded successfully: ${localPath} (${stats.size} bytes)`);
          
          if (stats.size === 0) {
            this.logger.warn(`⚠️ Downloaded file is empty: ${localPath}`);
            continue;
          }
          
          // If AVIF (by extension or by url or localPath), convert to JPG
          if (/avif/i.test(ext) || /avif/i.test(url) || /avif/i.test(localPath)) {
            this.logger.log(`🔄 Converting AVIF to JPG: ${localPath}`);
            const jpgPath = localPath.replace(/\.[^.]+$/, '.jpg'); // Replace any extension with .jpg
            await sharp(localPath).jpeg().toFile(jpgPath);
            fs.unlinkSync(localPath); // Delete original AVIF
            localPath = jpgPath; // Use JPG path
            this.logger.log(`✅ Converted to JPG: ${localPath}`);
          }
          
          localPaths.push(localPath);
          this.logger.log(`✅ Added to local paths: ${localPath}`);
        } else {
          this.logger.error(`❌ File not created after download: ${localPath}`);
        }
      } catch (error) {
        this.logger.error(`❌ Failed to download image ${i + 1}: ${url}`, error);
        this.logger.warn(`⚠️ Skipping image: ${url}`);
      }
    }
    
    this.logger.log(`📥 Download complete. ${localPaths.length}/${imageUrls.length} images successfully downloaded`);
    this.logger.log(`📥 Final local paths: ${JSON.stringify(localPaths)}`);
    return localPaths;
  }

  private async generateBackground(style: string): Promise<string> {
    try {
      this.logger.log(`🎨 Generating background for style: ${style}`);

      // TODO: Implement different background generation based on style
      switch (style) {
        case 'static':
          return await this.generateStaticBackground();
        case 'ai-background':
          return await this.generateAIBackground();
        case 'meme-style':
          return await this.generateMemeBackground();
        default:
          return await this.generateStaticBackground();
      }
    } catch (error) {
      this.logger.error('❌ Failed to generate background:', error);
      return await this.generateStaticBackground(); // Fallback
    }
  }

  private generateStaticBackground(): Promise<string> {
    // TODO: Generate solid color or gradient background
    return Promise.resolve('/assets/backgrounds/static-black.jpg');
  }

  private generateAIBackground(): Promise<string> {
    // TODO: Generate AI-powered dynamic background
    return Promise.resolve('/assets/backgrounds/ai-gradient.jpg');
  }

  private generateMemeBackground(): Promise<string> {
    // TODO: Generate meme-style background
    return Promise.resolve('/assets/backgrounds/meme-style.jpg');
  }

  private generateTextOverlays(opportunity: Opportunity): Promise<string[]> {
    try {
      this.logger.log(`📝 Generating text overlays for ${opportunity.productName}`);

      return Promise.resolve([opportunity.productName, `$${opportunity.price}`, opportunity.category]);
    } catch (error) {
      this.logger.error('❌ Failed to generate text overlays:', error);
      return Promise.resolve([]);
    }
  }

  private generateEffects(): Promise<string[]> {
    try {
      this.logger.log(`✨ Generating effects`);

      // TODO: Implement visual effects
      return Promise.resolve(['fade', 'zoom', 'pan']);
    } catch (error) {
      this.logger.error('❌ Failed to generate effects:', error);
      return Promise.resolve([]);
    }
  }

  getAvailableStyles(): Promise<string[]> {
    return Promise.resolve(['static', 'ai-background', 'meme-style', 'gradient', 'animated', 'minimal']);
  }
}
