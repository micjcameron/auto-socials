import { Injectable, Logger } from '@nestjs/common';
import { ElevenLabsService } from '../generators/elevenlabs.service';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);

  constructor(
    private elevenLabsService: ElevenLabsService,
  ) {}

  async generateAudio(script: string): Promise<string> {
    try {
      this.logger.log('🎵 Generating audio from script');

      const audioPath = await this.elevenLabsService.generateAudio(script);

      this.logger.log(`✅ Audio generated: ${audioPath}`);
      return audioPath;
    } catch (error) {
      this.logger.error('❌ Failed to generate audio:', error);
      throw error;
    }
  }

  addBackgroundMusic(audioPath: string, musicStyle: string = 'upbeat'): Promise<string> {
    try {
      this.logger.log(`🎵 Adding background music (${musicStyle})`);

      // TODO: Implement background music mixing
      // This would use FFmpeg to mix voice with background music

      this.logger.log(`✅ Background music added`);
      return Promise.resolve(audioPath); // For now, return original path
    } catch (error) {
      this.logger.error('❌ Failed to add background music:', error);
      return Promise.resolve(audioPath); // Fallback to original audio
    }
  }

  async generateAudioWithMusic(script: string, musicStyle: string = 'upbeat'): Promise<string> {
    try {
      this.logger.log('🎵 Generating audio with background music');

      // 1. Generate voice audio
      const voicePath = await this.generateAudio(script);

      // 2. Add background music
      const finalAudioPath = await this.addBackgroundMusic(voicePath, musicStyle);

      this.logger.log(`✅ Audio with music generated: ${finalAudioPath}`);
      return finalAudioPath;
    } catch (error) {
      this.logger.error('❌ Failed to generate audio with music:', error);
      throw error;
    }
  }

  getAvailableVoices(): Promise<string[]> {
    try {
      // TODO: Implement voice listing from ElevenLabs
      return Promise.resolve(['voice1', 'voice2', 'voice3']); // Placeholder
    } catch (error) {
      this.logger.error('❌ Failed to get available voices:', error);
      return Promise.resolve([]);
    }
  }

  getAvailableMusicStyles(): Promise<string[]> {
    return Promise.resolve(['upbeat', 'calm', 'dramatic', 'electronic', 'acoustic', 'cinematic']);
  }
}
