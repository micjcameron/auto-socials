import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import { VisualAssets } from './visual.service';
import * as fs from 'fs';
import { OpenAIService } from '../generators/openai.service';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    private configService: ConfigService,
    private openAIService: OpenAIService
  ) {
    const ffmpegPath = this.configService.get<string>('FFMPEG_PATH') || '/opt/homebrew/bin/ffmpeg';
    const ffprobePath = this.configService.get<string>('FFPROBE_PATH') || '/opt/homebrew/bin/ffprobe';

    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);

    this.logger.log(`🎬 FFmpeg path: ${ffmpegPath}`);
    this.logger.log(`🎬 FFprobe path: ${ffprobePath}`);
  }

  // Create a video from a single image for a given duration
  private async createStaticVideo(image: string, imageDuration: number, outputDir: string, index: number, timestamp: number, opportunity?: any, script?: string): Promise<string> {
    const tempVid = path.join(outputDir, `temp_img_${timestamp}_${index}.mp4`);
    this.logger.log(`🎬 Creating static video for image ${index}: ${image}`);
    this.logger.log(`🎬 Image duration: ${imageDuration.toFixed(2)}s`);
    this.logger.log(`🎬 Output temp video: ${tempVid}`);
    
    // Check if input image exists
    if (!fs.existsSync(image)) {
      this.logger.error(`❌ Input image does not exist: ${image}`);
      throw new Error(`Input image not found: ${image}`);
    }
    
    const imageStats = fs.statSync(image);
    this.logger.log(`🎬 Input image size: ${imageStats.size} bytes`);
    
    // Generate dynamic text overlays based on opportunity data
    let textOverlays;
    if (script && opportunity) {
      // Use AI-generated overlays if script is available
      textOverlays = await this.generateAITextOverlays(script, opportunity, imageDuration);
    } else {
      // Fallback to basic overlays
      textOverlays = this.generateDynamicTextOverlays(index, imageDuration, opportunity);
    }
    
    return new Promise((resolve, reject) => {
      this.logger.log(`🎬 Starting FFmpeg command for image ${index}`);
      
      let command = ffmpeg(image)
        .inputOptions(['-loop 1']) // Correct way to loop image
        .videoFilters('scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p');
      
      // Add text overlays if we have them
      if (textOverlays.length > 0) {
        this.logger.log(`🎬 Adding ${textOverlays.length} text overlays to image ${index}`);
        const textFilters = textOverlays.map((text) => 
          `drawtext=text='${text.text}':fontsize=${text.fontSize}:fontcolor=${text.color}:x=${text.x}:y=${text.y}:enable='between(t,${text.startTime},${text.endTime})':box=1:boxcolor=black@0.7:boxborderw=5:fontfile=/System/Library/Fonts/Arial.ttf`
        ).join(',');
        
        command = command.videoFilters(`scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p,${textFilters}`);
      }
      
      command
        .outputOptions([
          '-t', imageDuration.toString(),
          '-r', '30',
          '-pix_fmt', 'yuv420p',
        ])
        .output(tempVid)
        .on('start', (commandLine) => {
          this.logger.log(`🎬 FFmpeg command started for image ${index}: ${commandLine}`);
        })
        .on('progress', (progress) => {
          this.logger.log(`🎬 FFmpeg progress for image ${index}: ${progress.percent}% done`);
        })
        .on('end', () => {
          this.logger.log(`✅ Static video created successfully for image ${index}: ${tempVid}`);
          // Verify the output file exists and has content
          if (fs.existsSync(tempVid)) {
            const stats = fs.statSync(tempVid);
            this.logger.log(`✅ Temp video file size: ${stats.size} bytes`);
            if (stats.size > 0) {
              resolve(tempVid);
            } else {
              this.logger.error(`❌ Temp video file is empty: ${tempVid}`);
              reject(new Error(`Temp video file is empty: ${tempVid}`));
            }
          } else {
            this.logger.error(`❌ Temp video file not created: ${tempVid}`);
            reject(new Error(`Temp video file not created: ${tempVid}`));
          }
        })
        .on('error', err => {
          this.logger.error(`❌ FFmpeg error for image ${index}:`, err);
          reject(err);
        })
        .run();
    });
  }

  // Generate dynamic text overlays based on opportunity data
  private generateDynamicTextOverlays(frameIndex: number, duration: number, opportunity?: any): Array<{
    text: string;
    fontSize: number;
    color: string;
    x: string;
    y: string;
    startTime: number;
    endTime: number;
  }> {
    const overlays = [];
    
    if (!opportunity) {
      // Fallback text if no opportunity data
      overlays.push({
        text: 'LIMITED TIME OFFER',
        fontSize: 70,
        color: 'white',
        x: '(w-text_w)/2',
        y: 'h*0.2',
        startTime: 0,
        endTime: duration * 0.4
      });
      return overlays;
    }
    
    // Different text based on frame index and duration
    if (frameIndex === 0) {
      // First frame - hook with product name
      overlays.push({
        text: this.escapeText(`${opportunity.productName?.toUpperCase() || 'AMAZING PRODUCT'}`),
        fontSize: 50,
        color: 'white',
        x: '(w-text_w)/2',
        y: 'h*0.15',
        startTime: 0,
        endTime: duration * 0.5
      });
      
      overlays.push({
        text: this.escapeText(`SAVE ${opportunity.commissionRate || 50}% TODAY`),
        fontSize: 60,
        color: '#FFD700',
        x: '(w-text_w)/2',
        y: 'h*0.3',
        startTime: 0.5,
        endTime: duration * 0.7
      });
      
      overlays.push({
        text: this.escapeText(`ONLY $${opportunity.price || 'XX'}`),
        fontSize: 55,
        color: '#00FF00',
        x: '(w-text_w)/2',
        y: 'h*0.45',
        startTime: 1.0,
        endTime: duration * 0.8
      });
    } else {
      // Other frames - call to action
      overlays.push({
        text: this.escapeText('CLICK LINK BELOW'),
        fontSize: 50,
        color: 'white',
        x: '(w-text_w)/2',
        y: 'h*0.7',
        startTime: 0,
        endTime: duration * 0.6
      });
      
      overlays.push({
        text: this.escapeText('LIMITED TIME ONLY'),
        fontSize: 45,
        color: '#FF6B6B',
        x: '(w-text_w)/2',
        y: 'h*0.8',
        startTime: duration * 0.3,
        endTime: duration
      });
    }
    
    return overlays;
  }

  // Escape text for FFmpeg drawtext filter
  private escapeText(text: string): string {
    return text
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/:/g, '\\:')
      .replace(/=/g, '\\=')
      .replace(/,/g, '\\,')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  // Generate AI-powered dynamic text overlays based on script and opportunity
  private async generateAITextOverlays(script: string, opportunity: any, duration: number): Promise<Array<{
    text: string;
    fontSize: number;
    color: string;
    x: string;
    y: string;
    startTime: number;
    endTime: number;
  }>> {
    try {
      const aiTexts = await this.openAIService.generateTextOverlays(script, opportunity);
      const overlays = [];
      const segmentDuration = duration / 5; // 5 text overlays
      
      for (let i = 0; i < Math.min(aiTexts.length, 5); i++) {
        overlays.push({
          text: this.escapeText(aiTexts[i]),
          fontSize: 50 + (i * 5), // Varying font sizes
          color: i % 2 === 0 ? 'white' : '#FFD700',
          x: '(w-text_w)/2',
          y: `h*${0.2 + (i * 0.15)}`,
          startTime: i * segmentDuration,
          endTime: (i + 1) * segmentDuration
        });
      }
      
      return overlays;
    } catch (error) {
      this.logger.error('Failed to generate AI text overlays:', error);
      return this.generateDynamicTextOverlays(0, duration, opportunity);
    }
  }

  // Create a slideshow video from multiple images, then overlay audio
  private async createSlideshowVideo(audioPath: string, images: string[], imageDuration: number, opportunity?: any, script?: string): Promise<string> {
    this.logger.log(`🎬 Starting slideshow video creation`);
    this.logger.log(`🎬 Number of images: ${images.length}`);
    this.logger.log(`🎬 Image duration per image: ${imageDuration.toFixed(2)}s`);
    this.logger.log(`🎬 Audio path: ${audioPath}`);
    
    const timestamp = Date.now();
    const outputDir = path.join(process.cwd(), 'output');
    const outputPath = path.join(outputDir, `video_static_${timestamp}.mp4`);
    const concatListPath = path.join(outputDir, `concat_list_${timestamp}.txt`);

    this.logger.log(`📁 Output directory: ${outputDir}`);
    this.logger.log(`📁 Output path: ${outputPath}`);
    this.logger.log(`📁 Concat list path: ${concatListPath}`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      this.logger.log(`📁 Created output directory: ${outputDir}`);
    } else {
      this.logger.log(`📁 Using existing output directory: ${outputDir}`);
    }

    // 1. Create temporary videos for each image
    this.logger.log(`🎬 Step 1: Creating temporary videos for ${images.length} images`);
    const tempVideos: string[] = [];
    for (let i = 0; i < images.length; i++) {
      this.logger.log(`🎬 Processing image ${i + 1}/${images.length}: ${images[i]}`);
              try {
          const tempVid = await this.createStaticVideo(images[i], imageDuration, outputDir, i, timestamp, opportunity, script);
        // Log file existence and size
        if (fs.existsSync(tempVid)) {
          const stats = fs.statSync(tempVid);
          this.logger.log(`[Slideshow] Temp video created: ${tempVid} (${stats.size} bytes)`);
          if (stats.size > 0) {
            tempVideos.push(tempVid);
            this.logger.log(`✅ Added temp video ${i + 1} to list: ${tempVid}`);
          } else {
            this.logger.warn(`[Slideshow] Temp video is empty: ${tempVid}`);
          }
        } else {
          this.logger.warn(`[Slideshow] Temp video missing: ${tempVid}`);
        }
      } catch (error) {
        this.logger.error(`[Slideshow] Failed to create temp video for image ${images[i]}:`, error);
      }
    }

    this.logger.log(`🎬 Step 1 complete. Created ${tempVideos.length}/${images.length} valid temp videos`);

    if (tempVideos.length === 0) {
      this.logger.error('[Slideshow] No valid temp videos created. Aborting concat.');
      throw new Error('No valid temp videos created for slideshow.');
    }

    // 2. Create concat list file
    this.logger.log(`🎬 Step 2: Creating concat list file`);
    const concatList = tempVideos.map(v => `file '${v.replace(/'/g, "'\\''")}'`).join('\n');
    fs.writeFileSync(concatListPath, concatList);
    this.logger.log(`[Slideshow] Concat list file created: ${concatListPath}`);
    this.logger.log(`[Slideshow] Concat list contents:\n${concatList}`);

    // 3. Concatenate all temp videos
    this.logger.log(`🎬 Step 3: Concatenating ${tempVideos.length} temp videos`);
    await new Promise<void>((resolve, reject) => {
      this.logger.log(`🎬 Starting FFmpeg concat command`);
      ffmpeg()
        .input(concatListPath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions(['-c:v libx264', '-pix_fmt yuv420p', '-r 30'])
        .output(outputPath)
        .on('start', (commandLine) => {
          this.logger.log(`🎬 FFmpeg concat command started: ${commandLine}`);
        })
        .on('progress', (progress) => {
          this.logger.log(`🎬 FFmpeg concat progress: ${progress.percent}% done`);
        })
        .on('end', () => {
          this.logger.log(`✅ Concat completed successfully: ${outputPath}`);
          resolve();
        })
        .on('error', err => {
          this.logger.error(`❌ FFmpeg concat error:`, err);
          reject(err);
        })
        .run();
    });

    // 4. Overlay audio
    this.logger.log(`🎬 Step 4: Overlaying audio on concatenated video`);
    const finalOutputPath = path.join(outputDir, `video_static_final_${timestamp}.mp4`);
    await new Promise<void>((resolve, reject) => {
      this.logger.log(`🎬 Starting FFmpeg audio overlay command`);
      ffmpeg()
        .input(outputPath)
        .input(audioPath)
        .outputOptions([
          '-c:v copy',
          '-c:a aac',
          '-shortest',
        ])
        .output(finalOutputPath)
        .on('start', (commandLine) => {
          this.logger.log(`🎬 FFmpeg audio overlay command started: ${commandLine}`);
        })
        .on('progress', (progress) => {
          this.logger.log(`🎬 FFmpeg audio overlay progress: ${progress.percent}% done`);
        })
        .on('end', () => {
          this.logger.log(`✅ Audio overlay completed successfully: ${finalOutputPath}`);
          resolve();
        })
        .on('error', err => {
          this.logger.error(`❌ FFmpeg audio overlay error:`, err);
          reject(err);
        })
        .run();
    });

    // 5. Cleanup temp files
    this.logger.log(`🎬 Step 5: Cleaning up temporary files`);
    for (const tempVid of tempVideos) {
      try {
        fs.unlinkSync(tempVid);
        this.logger.log(`🗑️ Deleted temp video: ${tempVid}`);
      } catch (error) {
        this.logger.warn(`⚠️ Failed to delete temp video: ${tempVid}`, error);
      }
    }
    try {
      fs.unlinkSync(concatListPath);
      this.logger.log(`🗑️ Deleted concat list: ${concatListPath}`);
    } catch (error) {
      this.logger.warn(`⚠️ Failed to delete concat list: ${concatListPath}`, error);
    }
    try {
      fs.unlinkSync(outputPath);
      this.logger.log(`🗑️ Deleted intermediate video: ${outputPath}`);
    } catch (error) {
      this.logger.warn(`⚠️ Failed to delete intermediate video: ${outputPath}`, error);
    }

    this.logger.log(`✅ Static slideshow video created: ${finalOutputPath}`);
    return finalOutputPath;
  }

  async composeVideo(
    audioPath: string,
    visualAssets: VisualAssets,
    style: string = 'static',
    opportunity?: any,
    script?: string,
  ): Promise<string> {
    this.logger.log(`🎬 Starting video composition with style: ${style}`);
    this.logger.log(`🎬 Audio path: ${audioPath}`);
    this.logger.log(`🎬 Visual assets images count: ${visualAssets.images.length}`);
    this.logger.log(`🎬 Visual assets images: ${JSON.stringify(visualAssets.images)}`);
    
    const images = visualAssets.images;
    const numImages = images.length || 1;
    
    // 1. Get audio duration
    this.logger.log(`🎵 Getting audio duration from: ${audioPath}`);
    const audioDuration = await this.getVideoDuration(audioPath);
    this.logger.log(`🎵 Audio duration: ${audioDuration.toFixed(2)} seconds`);
    
    // 2. Calculate per-image duration
    const imageDuration = audioDuration / numImages;
    this.logger.log(`🖼️ Composing video: ${numImages} images, ${imageDuration.toFixed(2)}s per image, total ${audioDuration.toFixed(2)}s`);
    
    switch (style) {
      case 'static':
        this.logger.log(`🎬 Using static slideshow style`);
        return this.createSlideshowVideo(audioPath, images, imageDuration, opportunity, script);
      case 'dynamic':
        this.logger.log(`🎬 Using dynamic style (fallback to static)`);
        // TODO: Implement dynamic video with video assets
        return this.createDynamicVideo(audioPath, images, imageDuration);
      case 'ai-background':
        this.logger.log(`🎬 Using AI background style (fallback to static)`);
        // TODO: Implement AI background video with video assets
        return this.createAIBackgroundVideo(audioPath, images, imageDuration);
      case 'meme':
        this.logger.log(`🎬 Using meme style (fallback to static)`);
        // TODO: Implement meme style video with images - meme images and text overlays
        return this.createMemeStyleVideo(audioPath, images, imageDuration);
      default:
        this.logger.log(`🎬 Using default static slideshow style`);
        return this.createSlideshowVideo(audioPath, images, imageDuration, opportunity);
    }
  }

  // TODO: Update these to be different or as required
  private async createDynamicVideo(audioPath: string, images: string[], imageDuration: number): Promise<string> {
    return this.createSlideshowVideo(audioPath, images, imageDuration); // TEMP: fallback
  }
  private async createAIBackgroundVideo(audioPath: string, images: string[], imageDuration: number): Promise<string> {
    return this.createSlideshowVideo(audioPath, images, imageDuration); // TEMP: fallback
  }
  private async createMemeStyleVideo(audioPath: string, images: string[], imageDuration: number): Promise<string> {
    return this.createSlideshowVideo(audioPath, images, imageDuration); // TEMP: fallback
  }

  async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(new Error(err.message));
        } else {
          resolve(metadata.format.duration || 0);
        }
      });
    });
  }

  async createThumbnail(videoPath: string, outputPath?: string): Promise<string> {
    const thumbnailPath = outputPath || videoPath.replace('.mp4', '_thumb.jpg');

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['50%'],
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size: '1080x1920',
        })
        .on('end', () => {
          this.logger.log(`Thumbnail created: ${thumbnailPath}`);
          resolve(thumbnailPath);
        })
        .on('error', err => {
          this.logger.error('Thumbnail creation error:', err);
          reject(new Error(err.message));
        });
    });
  }

  private getDefaultBackground(): string {
    // Use a color background that will naturally loop
    return 'color=size=1080x1920:color=black:duration=30';
  }

  getAvailableStyles(): Promise<string[]> {
    return Promise.resolve(['static', 'dynamic', 'ai-background', 'meme-style', 'gradient', 'animated']);
  }
}
