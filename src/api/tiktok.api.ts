import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseApiService } from './base-api.service';
import * as fs from 'fs';

export interface TikTokPostResponse {
  success: boolean;
  post_id?: string;
  error?: string;
}

export interface TikTokVideoInfo {
  post_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

@Injectable()
export class TikTokApiService extends BaseApiService {
  private readonly sessionToken: string;

  constructor(configService: ConfigService) {
    super(configService, 'https://api.tiktok.com/v1', {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    this.sessionToken = configService.get<string>('TIKTOK_SESSION_TOKEN');
  }

  async uploadVideo(
    videoPath: string,
    caption: string,
    hashtags: string[] = []
  ): Promise<TikTokPostResponse> {
    try {
      this.logger.log('Uploading video to TikTok...');

      // Read video file
      const videoBuffer = fs.readFileSync(videoPath);

      // Create form data
      const formData = new FormData();
      formData.append(
        'video',
        new Blob([videoBuffer], { type: 'video/mp4' }),
        'video.mp4'
      );
      formData.append('caption', caption);
      formData.append('hashtags', hashtags.join(' '));
      formData.append('privacy', 'public');

      const response = await this.upload<TikTokPostResponse>(
        '/video/upload',
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.sessionToken}`,
          },
        }
      );

      if (response.success) {
        this.logger.log(
          `Video uploaded successfully to TikTok: ${response.post_id}`
        );
      } else {
        this.logger.error(`TikTok upload failed: ${response.error}`);
      }

      return response;
    } catch (error) {
      this.logger.error('Failed to upload video to TikTok:', error);
      throw error;
    }
  }

  async getVideoInfo(postId: string): Promise<TikTokVideoInfo> {
    try {
      const response = await this.get<TikTokVideoInfo>(
        `/video/${postId}/info`,
        {
          headers: {
            Authorization: `Bearer ${this.sessionToken}`,
          },
        }
      );

      return response;
    } catch (error) {
      this.logger.error(`Failed to get video info for ${postId}:`, error);
      throw error;
    }
  }

  async deleteVideo(postId: string): Promise<boolean> {
    try {
      await this.delete(`/video/${postId}`, {
        headers: {
          Authorization: `Bearer ${this.sessionToken}`,
        },
      });

      this.logger.log(`Video ${postId} deleted from TikTok`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete video ${postId}:`, error);
      return false;
    }
  }

  async getTrendingHashtags(): Promise<string[]> {
    try {
      const response = await this.get<{ hashtags: string[] }>(
        '/trending/hashtags'
      );
      return response.hashtags;
    } catch (error) {
      this.logger.error('Failed to get trending hashtags:', error);
      return ['viral', 'trending', 'fyp', 'foryou'];
    }
  }

  async getAccountInfo(): Promise<any> {
    try {
      const response = await this.get('/user/info', {
        headers: {
          Authorization: `Bearer ${this.sessionToken}`,
        },
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to get account info:', error);
      throw error;
    }
  }
}
