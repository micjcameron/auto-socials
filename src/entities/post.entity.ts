import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Video } from './video.entity';
import { Analytics } from './analytics.entity';
import { AffiliateEarnings } from './affiliate-earnings.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  postId: string; // external platform post ID

  @Column({ type: 'varchar', length: 50 })
  platform: string; // telegram, tiktok, instagram, youtube, etc.

  @Column({ type: 'text', nullable: true })
  caption: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: string; // pending, posted, failed

  @Column({ type: 'timestamp with time zone', nullable: true })
  postedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  engagementData: any; // likes, views, comments, etc.

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Video, (video: Video) => video.posts)
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @OneToMany(() => Analytics, (analytics: Analytics) => analytics.post)
  analytics: Analytics[];

  @OneToMany(() => AffiliateEarnings, (earnings: AffiliateEarnings) => earnings.post)
  affiliateEarnings: AffiliateEarnings[];
}
