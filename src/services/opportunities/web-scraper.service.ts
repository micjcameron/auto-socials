import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WebScraperService {
  private readonly logger = new Logger(WebScraperService.name);

  async extractProductImages(url: string): Promise<string[]> {
    this.logger.log(`🔍 Extracting product images from: ${url}`);
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
      });
      
      this.logger.log(`✅ Successfully fetched page: ${url} (${response.data.length} bytes)`);
      
      const $ = cheerio.load(response.data);
      const images: string[] = [];
      
      // Look for common image selectors
      const selectors = [
        'img[src*="product"]',
        'img[src*="image"]',
        '.product-image img',
        '.product-gallery img',
        '.gallery img',
        'img[alt*="product"]',
        'img[alt*="image"]',
      ];
      
      for (const selector of selectors) {
        const foundImages = $(selector);
        this.logger.log(`🔍 Found ${foundImages.length} images with selector: ${selector}`);
        
        foundImages.each((i, element) => {
          const src = $(element).attr('src');
          if (src) {
            const fullUrl = src.startsWith('http') ? src : new URL(src, url).href;
            images.push(fullUrl);
            this.logger.log(`🖼️ Found image: ${fullUrl}`);
          }
        });
      }
      
      this.logger.log(`✅ Extracted ${images.length} product images from ${url}`);
      return images;
    } catch (error) {
      this.logger.error(`❌ Failed to extract images from ${url}:`, error);
      return [];
    }
  }

  async downloadImage(url: string, outputPath: string): Promise<void> {
    this.logger.log(`📥 Downloading image from: ${url}`);
    this.logger.log(`📥 Output path: ${outputPath}`);
    
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 15000,
      });
      
      this.logger.log(`📥 Download successful: ${response.data.length} bytes`);
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        this.logger.log(`📁 Created output directory: ${outputDir}`);
      }
      
      // Write the file
      fs.writeFileSync(outputPath, response.data);
      
      // Verify the file was written
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        this.logger.log(`✅ Image downloaded successfully: ${outputPath} (${stats.size} bytes)`);
        
        if (stats.size === 0) {
          this.logger.warn(`⚠️ Downloaded file is empty: ${outputPath}`);
          throw new Error(`Downloaded file is empty: ${outputPath}`);
        }
      } else {
        this.logger.error(`❌ File not created after download: ${outputPath}`);
        throw new Error(`File not created: ${outputPath}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to download image from ${url}:`, error);
      throw error;
    }
  }
}
