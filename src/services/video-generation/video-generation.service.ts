import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entities/video.entity';
import { Opportunity } from '../../entities/opportunity.entity';
import { ScriptService } from './script.service';
import { AudioService } from './audio.service';
import { VisualService } from './visual.service';
import { CompositionService } from './composition.service';

@Injectable()
export class VideoGenerationService {
  private readonly logger = new Logger(VideoGenerationService.name);

  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
    private scriptService: ScriptService,
    private audioService: AudioService,
    private visualService: VisualService,
    private compositionService: CompositionService
  ) {}

  async generateVideoFromOpportunity(
    opportunityId: string,
    style: string = 'static'
  ): Promise<Video> {
    try {
      this.logger.log(
        `🎬 Starting video generation for opportunity: ${opportunityId}`
      );

      // 1. Get opportunity
      const opportunity = await this.opportunityRepository.findOne({
        where: { id: opportunityId },
      });

      if (!opportunity) {
        throw new Error(`Opportunity not found: ${opportunityId}`);
      }

      // 2. Generate script
      this.logger.log('📝 Generating script...');
      const script = await this.scriptService.generateScript(
        opportunity,
        style
      );

      // 3. Generate audio
      this.logger.log('🎵 Generating audio...');
      const audioPath = await this.audioService.generateAudio(script);

      // 4. Generate visuals
      this.logger.log('🎨 Generating visuals...');
      const visualAssets = await this.visualService.generateVisuals(
        opportunity,
        style
      );

      // 5. Compose final video
      this.logger.log('🎬 Composing video...');
      const videoPath = await this.compositionService.composeVideo(
        audioPath,
        visualAssets,
        style
      );

      // 6. Create thumbnail
      this.logger.log('🖼️ Creating thumbnail...');
      const thumbnailPath =
        await this.compositionService.createThumbnail(videoPath);

      // 7. Get video metadata
      const duration =
        await this.compositionService.getVideoDuration(videoPath);

      // 8. Save to database
      const video = this.videoRepository.create({
        opportunityId: opportunity.id,
        title: `${opportunity.productName} - Viral Video`,
        description: opportunity.description,
        script,
        videoPath,
        thumbnailPath,
        duration: Math.round(duration),
        style,
        status: 'completed',
      });

      const savedVideo = await this.videoRepository.save(video);
      this.logger.log(`✅ Video generated successfully: ${savedVideo.id}`);

      return savedVideo;
    } catch (error) {
      this.logger.error('❌ Failed to generate video:', error);
      throw error;
    }
  }

  async generateDailyVideos(count: number = 3): Promise<Video[]> {
    try {
      this.logger.log(`🎬 Generating ${count} daily videos...`);

      const opportunities = await this.opportunityRepository
        .createQueryBuilder('opportunity')
        .leftJoin('opportunity.videos', 'video')
        .where('video.id IS NULL')
        .orderBy('opportunity.trendingScore', 'DESC')
        .limit(count)
        .getMany();

      if (opportunities.length === 0) {
        this.logger.warn(
          '⚠️ No unused opportunities found for video generation'
        );
        return [];
      }

      const videos: Video[] = [];
      const styles = ['static', 'ai-background', 'meme-style'];

      for (let i = 0; i < Math.min(opportunities.length, count); i++) {
        const opportunity = opportunities[i];
        const style = styles[i % styles.length];

        try {
          const video = await this.generateVideoFromOpportunity(
            opportunity.id,
            style
          );
          videos.push(video);
        } catch (error) {
          this.logger.error(
            `❌ Failed to generate video for opportunity ${opportunity.id}:`,
            error
          );
        }
      }

      this.logger.log(`✅ Successfully generated ${videos.length} videos`);
      return videos;
    } catch (error) {
      this.logger.error('❌ Failed to generate daily videos:', error);
      throw error;
    }
  }
}
