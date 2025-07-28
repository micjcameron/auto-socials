import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async count(): Promise<number> {
    return this.opportunityRepository.count();
  }
}
