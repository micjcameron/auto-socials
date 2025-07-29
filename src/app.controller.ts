import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { OpportunitiesService } from './services/opportunities/opportunities.service';
import { SchedulerService } from './services/scheduler.service';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dtos/opportunity.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly opportunitiesService: OpportunitiesService,
    private readonly schedulerService: SchedulerService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  // --- ADMIN OPPORTUNITY ENDPOINTS ---
  @Get('admin/opportunities')
  async listOpportunities(@Query('limit') limit?: number) {
    return this.opportunitiesService.getAllOpportunities(limit ? Number(limit) : 50);
  }

  @Get('admin/opportunities/:id')
  async getOpportunity(@Param('id') id: string) {
    return this.opportunitiesService.getOpportunityById(id);
  }

  @Post('admin/opportunities')
  async createOpportunity(@Body() dto: CreateOpportunityDto, @Req() req) {
    console.log('Raw body:', req.body);
    console.log('DTO:', dto);
    return this.opportunitiesService.createOpportunity(dto);
  }

  @Put('admin/opportunities/:id')
  async updateOpportunity(
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.updateOpportunity(id, dto);
  }

  @Delete('admin/opportunities/:id')
  async deleteOpportunity(@Param('id') id: string) {
    return this.opportunitiesService.deleteOpportunity(id);
  }

  @Get('scheduler/config')
  getScheduleConfig() {
    return this.schedulerService.getScheduleConfig();
  }

  @Post('scheduler/manual-generate')
  async manualGenerate(@Body() body: { platform: string; count?: number; isAffiliate: boolean }) {
    try {
      const { platform, count = 1, isAffiliate } = body;
      await this.schedulerService['compositionService'].generateAndPost(platform, count, isAffiliate);
      return { success: true, message: `Triggered generateAndPost for ${platform} (${isAffiliate ? 'affiliate' : 'organic'}) x${count}` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
