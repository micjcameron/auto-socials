import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { VisualAssets } from './visual.service';

@Injectable()
export class CompositionService {
  private readonly logger = new Logger(CompositionService.name);

  constructor(private configService: ConfigService) {
    const ffmpegPath =
      this.configService.get<string>('FFMPEG_PATH') ||
      '/opt/homebrew/bin/ffmpeg';
    const ffprobePath =
      this.configService.get<string>('FFPROBE_PATH') ||
      '/opt/homebrew/bin/ffprobe';

    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);

    this.logger.log(`🎬 FFmpeg path: ${ffmpegPath}`);
    this.logger.log(`🎬 FFprobe path: ${ffprobePath}`);
  }

  async composeVideo(
    audioPath: string,
    visualAssets: VisualAssets,
    style: string = 'static'
  ): Promise<string> {
    try {
      this.logger.log(`🎬 Composing video with style: ${style}`);

      const timestamp = Date.now();
      const outputPath = path.join(
        process.cwd(),
        'output',
        `video_${timestamp}.mp4`
      );

      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      switch (style) {
        case 'static':
          return await this.createStaticVideo(
            audioPath,
            visualAssets,
            outputPath
          );
        case 'dynamic':
          return await this.createDynamicVideo(
            audioPath,
            visualAssets,
            outputPath
          );
        case 'ai-background':
          return await this.createAIBackgroundVideo(
            audioPath,
            visualAssets,
            outputPath
          );
        case 'meme-style':
          return await this.createMemeStyleVideo(
            audioPath,
            visualAssets,
            outputPath
          );
        default:
          return await this.createStaticVideo(
            audioPath,
            visualAssets,
            outputPath
          );
      }
    } catch (error) {
      this.logger.error('❌ Failed to compose video:', error);
      throw error;
    }
  }

  private async createStaticVideo(
    audioPath: string,
    visualAssets: VisualAssets,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.logger.log('🎬 Creating static video');

      ffmpeg()
        .input('color=size=1080x1920:color=black:duration=30')
        .input(audioPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-shortest',
          '-pix_fmt yuv420p',
          '-r 30',
        ])
        .output(outputPath)
        .on('end', () => {
          this.logger.log(`✅ Static video created: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', err => {
          this.logger.error('❌ FFmpeg error:', err);
          reject(new Error(err.message));
        })
        .run();
    });
  }

  private async createDynamicVideo(
    audioPath: string,
    visualAssets: VisualAssets,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.logger.log('🎬 Creating dynamic video');

      // TODO: Implement dynamic video with multiple images
      this.createStaticVideo(audioPath, visualAssets, outputPath)
        .then(resolve)
        .catch(reject);
    });
  }

  private async createAIBackgroundVideo(
    audioPath: string,
    visualAssets: VisualAssets,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.logger.log('🎬 Creating AI background video');

      ffmpeg()
        .input('color=size=1080x1920:color=gradient=red:blue:duration=30')
        .input(audioPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-shortest',
          '-pix_fmt yuv420p',
          '-r 30',
        ])
        .output(outputPath)
        .on('end', () => {
          this.logger.log(`✅ AI background video created: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', err => {
          this.logger.error('❌ FFmpeg error:', err);
          reject(new Error(err.message));
        })
        .run();
    });
  }

  private async createMemeStyleVideo(
    audioPath: string,
    visualAssets: VisualAssets,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.logger.log('🎬 Creating meme style video');

      const text = visualAssets.textOverlays[0] || 'VIRAL CONTENT';

      ffmpeg()
        .input('color=size=1080x1920:color=black:duration=30')
        .input(audioPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-shortest',
          '-pix_fmt yuv420p',
          "-vf scale=1080:1920,drawtext=text='" +
            text +
            "':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
          '-r 30',
        ])
        .output(outputPath)
        .on('end', () => {
          this.logger.log(`✅ Meme style video created: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', err => {
          this.logger.error('❌ FFmpeg error:', err);
          reject(new Error(err.message));
        })
        .run();
    });
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

  async createThumbnail(
    videoPath: string,
    outputPath?: string
  ): Promise<string> {
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
    return Promise.resolve([
      'static',
      'dynamic',
      'ai-background',
      'meme-style',
      'gradient',
      'animated',
    ]);
  }
}
