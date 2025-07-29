import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

@Injectable()
export class ElevenLabsService {
  private readonly logger = new Logger(ElevenLabsService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ELEVENLABS_API_KEY');
  }

  getVoiceId(): string {
    // In the future, add logic to select voice by user, gender, etc.
    return DEFAULT_VOICE_ID;
  }

  async generateAudio(script: string, voiceId?: string): Promise<string> {
    try {
      this.logger.log('Generating audio from script...');

      const useVoiceId = voiceId || this.getVoiceId();

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${useVoiceId}`,
        {
          text: script,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            Accept: 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          responseType: 'arraybuffer',
        }
      );

      // Create output directory if it doesn't exist
      const outputDir = path.join(process.cwd(), 'output', 'audio');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const audioPath = path.join(outputDir, `audio_${timestamp}.mp3`);

      // Save audio file
      fs.writeFileSync(audioPath, response.data);

      this.logger.log(`Audio generated and saved to: ${audioPath}`);
      return audioPath;
    } catch (error) {
      this.logger.error('Failed to generate audio:', error);
      throw error;
    }
  }

  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });
      return response.data.voices;
    } catch (error) {
      this.logger.error('Failed to get voices:', error);
      return [];
    }
  }

  async cloneVoice(name: string, audioFile: string): Promise<string> {
    try {
      this.logger.log(`Cloning voice: ${name}`);

      const audioBuffer = fs.readFileSync(audioFile);
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });

      const formData = new FormData();
      formData.append('name', name);
      formData.append('files', blob, 'audio.mp3');

      const response = await axios.post(`${this.baseUrl}/voices/add`, formData, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'multipart/form-data',
        },
      });

      this.logger.log(`Voice cloned successfully: ${response.data.voice_id}`);
      return response.data.voice_id;
    } catch (error) {
      this.logger.error('Failed to clone voice:', error);
      throw error;
    }
  }
}
