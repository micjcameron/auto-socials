import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Opportunity } from './opportunity.entity';
import { Post } from './post.entity';

@Entity('affiliate_earnings')
export class AffiliateEarnings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  opportunityId: string;

  @Column({ type: 'uuid', nullable: true })
  postId: string;

  @Column({ type: 'varchar', length: 50 })
  platform: string;

  @Column({ type: 'int', default: 0 })
  clicks: number;

  @Column({ type: 'int', default: 0 })
  conversions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  revenue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  commissionRate: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  recordedAt: Date;

  // Relationships
  @ManyToOne(
    () => Opportunity,
    (opportunity: Opportunity) => opportunity.affiliateEarnings
  )
  @JoinColumn({ name: 'opportunityId' })
  opportunity: Opportunity;

  @ManyToOne(() => Post, (post: Post) => post.affiliateEarnings)
  @JoinColumn({ name: 'postId' })
  post: Post;
}
