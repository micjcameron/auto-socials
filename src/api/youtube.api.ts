import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseApiService } from './base-api.service';
import * as fs from 'fs';

export interface YouTubeUploadResponse {
  success: boolean;
  video_id?: string;
  error?: string;
}

export interface YouTubeVideoInfo {
  video_id: string;
  title: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
}

@Injectable()
export class YouTubeApiService extends BaseApiService {
  private readonly apiKey: string;
  private readonly channelId: string;

  constructor(configService: ConfigService) {
    super(configService, 'https://www.googleapis.com/youtube/v3');

    this.apiKey = configService.get<string>('YOUTUBE_API_KEY');
    this.channelId = configService.get<string>('YOUTUBE_CHANNEL_ID');
  }

  async uploadShort(
    videoPath: string,
    title: string,
    description: string,
    tags: string[] = []
  ): Promise<YouTubeUploadResponse> {
    try {
      this.logger.log('Uploading Short to YouTube...');

      // Read video file
      const videoBuffer = fs.readFileSync(videoPath);

      // Create form data for YouTube API
      const formData = new FormData();
      formData.append('video', new Blob([videoBuffer], { type: 'video/mp4' }), 'short.mp4');
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', tags.join(','));
      formData.append('categoryId', '22'); // People & Blogs
      formData.append('privacyStatus', 'public');

      const response = await this.upload<YouTubeUploadResponse>('/videos', formData, {
        params: {
          part: 'snippet,status',
          key: this.apiKey,
        },
      });

      if (response.success) {
        this.logger.log(`Short uploaded successfully to YouTube: ${response.video_id}`);
      } else {
        this.logger.error(`YouTube upload failed: ${response.error}`);
      }

      return response;
    } catch (error) {
      this.logger.error('Failed to upload Short to YouTube:', error);
      throw error;
    }
  }

  async getVideoInfo(videoId: string): Promise<YouTubeVideoInfo> {
    try {
      const response = await this.get<any>('/videos', {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId,
          key: this.apiKey,
        },
      });

      if (response.items && response.items.length > 0) {
        const video = response.items[0];
        return {
          video_id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          views: parseInt(video.statistics.viewCount) || 0,
          likes: parseInt(video.statistics.likeCount) || 0,
          comments: parseInt(video.statistics.commentCount) || 0,
          duration: video.contentDetails.duration,
        };
      }

      throw new Error('Video not found');
    } catch (error) {
      this.logger.error(`Failed to get video info for ${videoId}:`, error);
      throw error;
    }
  }

  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      await this.delete(`/videos`, {
        params: {
          id: videoId,
          key: this.apiKey,
        },
      });

      this.logger.log(`Video ${videoId} deleted from YouTube`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete video ${videoId}:`, error);
      return false;
    }
  }

  async getChannelStats(): Promise<any> {
    try {
      const response = await this.get('/channels', {
        params: {
          part: 'statistics',
          id: this.channelId,
          key: this.apiKey,
        },
      });

      return (response as any).items?.[0]?.statistics || {};
    } catch (error) {
      this.logger.error('Failed to get channel stats:', error);
      throw error;
    }
  }

  async getTrendingVideos(category: string = '22'): Promise<any[]> {
    try {
      const response = await this.get('/videos', {
        params: {
          part: 'snippet',
          chart: 'mostPopular',
          videoCategoryId: category,
          maxResults: 10,
          key: this.apiKey,
        },
      });

      return (response as any).items || [];
    } catch (error) {
      this.logger.error('Failed to get trending videos:', error);
      return [];
    }
  }

  async updateVideoMetadata(videoId: string, title?: string, description?: string, tags?: string[]): Promise<boolean> {
    try {
      const updateData: any = {
        id: videoId,
        snippet: {},
      };

      if (title) updateData.snippet.title = title;
      if (description) updateData.snippet.description = description;
      if (tags) updateData.snippet.tags = tags;

      await this.put(`/videos`, updateData, {
        params: {
          part: 'snippet',
          key: this.apiKey,
        },
      });

      this.logger.log(`Video ${videoId} metadata updated`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to update video ${videoId} metadata:`, error);
      return false;
    }
  }
}
