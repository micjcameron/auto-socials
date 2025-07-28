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
import { Opportunity } from './opportunity.entity';
import { Post } from './post.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  opportunityId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  script: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoPath: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailPath: string;

  @Column({ type: 'int', nullable: true })
  duration: number; // in seconds

  @Column({ type: 'varchar', length: 50, nullable: true })
  style: string; // static, ai-background, meme-style, etc.

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: string; // pending, processing, completed, failed

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(
    () => Opportunity,
    (opportunity: Opportunity) => opportunity.videos
  )
  @JoinColumn({ name: 'opportunityId' })
  opportunity: Opportunity;

  @OneToMany(() => Post, (post: Post) => post.video)
  posts: Post[];
}
