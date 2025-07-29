import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisualService } from './video-generation/visual.service';
import { VideoService } from './video-generation/video.service';
import { AudioService } from './video-generation/audio.service';
import { ScriptService } from './video-generation/script.service';
import { Opportunity } from '../entities/opportunity.entity';
import { OpportunitiesService } from './opportunities/opportunities.service';
import { Video } from '../entities/video.entity';

@Injectable()
export class CompositionService {
  private readonly logger = new Logger(CompositionService.name);

  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    private visualService: VisualService,
    private videoService: VideoService,
    private audioService: AudioService,
    private scriptService: ScriptService,
    private opportunitiesService: OpportunitiesService,
  ) {}

  async generateVideoFromOpportunity(
    opportunity: Opportunity,
    isAffiliate: boolean,
    style: string = 'static',
  ): Promise<Video> {
    try {
      this.logger.log(`🎬 Starting video generation for opportunity: ${opportunity.id}`);
      this.logger.log(`🎬 Opportunity details: ${opportunity.productName} (${isAffiliate ? 'affiliate' : 'organic'})`);
      this.logger.log(`🎬 Style: ${style}`);

      // 2. Generate script
      this.logger.log('📝 Step 1: Generating script...');
      const script = await this.scriptService.generateScript(opportunity, style, isAffiliate);
      this.logger.log(`📝 Script generated successfully (${script.length} characters)`);
      this.logger.log(`📝 Script preview: ${script.substring(0, 100)}...`);

      // 3. Generate audio
      this.logger.log('🎵 Step 2: Generating audio...');
      const audioPath = await this.audioService.generateAudio(script);
      this.logger.log(`🎵 Audio generated successfully: ${audioPath}`);

      // 4. Generate visuals
      this.logger.log('🎨 Step 3: Generating visuals...');
      const visualAssets = await this.visualService.generateVisuals(opportunity, style);
      this.logger.log(`🎨 Visuals generated successfully`);
      this.logger.log(`🎨 Visual assets images count: ${visualAssets.images.length}`);

      // 5. Compose final video
      this.logger.log('🎬 Step 4: Composing video...');
      const videoPath = await this.videoService.composeVideo(audioPath, visualAssets, style, opportunity, script);
      this.logger.log(`🎬 Video composed successfully: ${videoPath}`);

      // 6. Create thumbnail
      this.logger.log('🖼️ Step 5: Creating thumbnail...');
      const thumbnailPath = await this.videoService.createThumbnail(videoPath);
      this.logger.log(`🖼️ Thumbnail created successfully: ${thumbnailPath}`);

      // 7. Get video metadata
      this.logger.log('📊 Step 6: Getting video metadata...');
      const duration = await this.videoService.getVideoDuration(videoPath);
      this.logger.log(`📊 Video duration: ${duration.toFixed(2)} seconds`);

      // 8. Save to database
      this.logger.log('💾 Step 7: Saving to database...');
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
      this.logger.log(`💾 Video saved to database with ID: ${savedVideo.id}`);

      // 9. Mark opportunity as used
      this.logger.log('🏷️ Step 8: Marking opportunity as used...');
      await this.opportunitiesService.markOpportunityAsUsed(opportunity.id);
      this.logger.log(`🏷️ Opportunity marked as used: ${opportunity.id}`);

      this.logger.log(`✅ Video generation completed successfully: ${savedVideo.id}`);
      return savedVideo;
    } catch (error) {
      this.logger.error('❌ Failed to generate video:', error);
      throw error;
    }
  }

  // Orchestrate batch video generation and posting
  async generateAndPost(platform: string, count: number = 1, isAffiliate: boolean = false) {
    try {
      this.logger.log(`🎬 Starting generateAndPost for ${platform}`);
      this.logger.log(`🎬 Count: ${count}, isAffiliate: ${isAffiliate}`);
      
      for (let i = 0; i < count; i++) {
        this.logger.log(`🎬 Processing video ${i + 1}/${count}`);
        
        try {
          let opportunity = null;
          
          if (isAffiliate) {
            this.logger.log(`💰 Generating affiliate video for ${platform}`);
            opportunity = await this.opportunitiesService.getRandomAffiliateOpportunity();
            this.logger.log(`💰 Affiliate opportunity found: ${opportunity ? opportunity.productName : 'none'}`);
          } else {
            this.logger.log(`🎯 Generating organic video for ${platform}`);
            opportunity = await this.opportunitiesService.getRandomOrganicOpportunity();
            this.logger.log(`🎯 Organic opportunity found: ${opportunity ? opportunity.productName : 'none'}`);
          }
          
          if (opportunity) {
            this.logger.log(`✅ Opportunity selected: ${opportunity.productName} (ID: ${opportunity.id})`);
            await this.generateVideoFromOpportunity(opportunity, isAffiliate);
            this.logger.log(`✅ Video ${i + 1} generated and posted to ${platform}`);
          } else {
            this.logger.warn(`⚠️ No ${isAffiliate ? 'affiliate' : 'organic'} opportunity found for ${platform}!`);
          }
        } catch (error) {
          this.logger.error(`❌ Failed to generate video ${i + 1} for ${platform}:`, error);
        }
      }
      
      this.logger.log(`✅ generateAndPost completed for ${platform}`);
    } catch (error) {
      this.logger.error(`❌ Failed to generate and post to ${platform}:`, error);
    }
  }
}
