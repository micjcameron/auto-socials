import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  postId: string;

  @Column({ type: 'varchar', length: 50 })
  platform: string;

  @Column({ type: 'varchar', length: 50 })
  metricType: string; // views, likes, comments, shares, clicks

  @Column({ type: 'int' })
  metricValue: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  recordedAt: Date;

  // Relationships
  @ManyToOne(() => Post, (post: Post) => post.analytics)
  @JoinColumn({ name: 'postId' })
  post: Post;
}
