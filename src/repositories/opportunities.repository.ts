import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, DeleteResult } from 'typeorm';
import { Opportunity } from '../entities/opportunity.entity';

@Injectable()
export class OpportunitiesRepository {
  constructor(
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>
  ) {}

  async findAll(limit: number = 10): Promise<Opportunity[]> {
    return this.opportunityRepository.find({
      select: [
        'id',
        'productName',
        'platform',
        'commissionRate',
        'price',
        'category',
        'description',
        'images',
        'thumbnail',
        'affiliateUrl',
        'productUrl',
        'paymentFrequency',
        'lastUsedAt',
      ],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findById(id: string): Promise<Opportunity | null> {
    return this.opportunityRepository.findOne({
      where: { id },
    });
  }

  create(data: DeepPartial<Opportunity>): Opportunity {
    return this.opportunityRepository.create(data);
  }

  save(opportunity: Opportunity): Promise<Opportunity> {
    return this.opportunityRepository.save(opportunity);
  }

  delete(id: string): Promise<DeleteResult> {
    return this.opportunityRepository.delete(id);
  }

  async count(): Promise<number> {
    return this.opportunityRepository.count();
  }

  async getRandomAffiliateOpportunity(): Promise<Opportunity | null> {
    return this.opportunityRepository
      .createQueryBuilder('opportunity')
      .where('opportunity.isAffiliate = true')
      .orderBy('RANDOM()')
      .getOne();
  }

  async getRandomOrganicOpportunity(): Promise<Opportunity | null> {
    return this.opportunityRepository
      .createQueryBuilder('opportunity')
      .where('opportunity.isAffiliate = false')
      .orderBy('RANDOM()')
      .getOne();
  }
}
