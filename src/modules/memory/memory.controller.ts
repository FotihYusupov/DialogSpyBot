import { Controller, Get, Post, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SmartMemoryService } from './smart-memory.service';

@Controller('admin/memory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin', 'admin')
export class MemoryController {
  constructor(private readonly memoryService: SmartMemoryService) {}

  @Get('stats')
  async getMemoryStats(@Query('ownerId') ownerId?: string) {
    const numericOwnerId = ownerId ? Number(ownerId) : undefined;
    return this.memoryService.getMemoryStats(numericOwnerId);
  }

  @Get('contacts')
  async getContacts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('ownerId') ownerId?: string,
    @Query('premiumOnly') premiumOnly?: string,
    @Query('updatedToday') updatedToday?: string,
    @Query('updatedThisWeek') updatedThisWeek?: string,
    @Query('hasFacts') hasFacts?: string,
    @Query('hasInterests') hasInterests?: string,
    @Query('hasTimeline') hasTimeline?: string,
    @Query('language') language?: string,
    @Query('country') country?: string
  ) {
    return this.memoryService.getPaginatedContacts({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      sortBy,
      sortOrder,
      ownerId: ownerId ? Number(ownerId) : undefined,
      premiumOnly: premiumOnly === 'true',
      updatedToday: updatedToday === 'true',
      updatedThisWeek: updatedThisWeek === 'true',
      hasFacts: hasFacts === 'true',
      hasInterests: hasInterests === 'true',
      hasTimeline: hasTimeline === 'true',
      language,
      country,
    });
  }

  @Get('profiles')
  async getProfiles(
    @Query('ownerId') ownerId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    return this.memoryService.getPaginatedContacts({
      ownerId: ownerId ? Number(ownerId) : undefined,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
    });
  }

  @Get('profiles/:contactId')
  async getContactGraph(
    @Param('contactId') contactId: string,
    @Query('ownerId') ownerId?: string
  ) {
    const numericOwnerId = ownerId ? Number(ownerId) : 0;
    return this.memoryService.getContactMemoryGraph(numericOwnerId, contactId);
  }

  @Delete('facts/:factId')
  async deleteFact(@Param('factId') factId: string) {
    return this.memoryService.deleteFact(factId);
  }

  @Delete('profiles/:contactId')
  async deleteContactMemory(
    @Param('contactId') contactId: string,
    @Query('ownerId') ownerId?: string
  ) {
    const numericOwnerId = ownerId ? Number(ownerId) : 0;
    return this.memoryService.deleteContactMemory(numericOwnerId, contactId);
  }

  @Post('profiles/:contactId/refresh-summary')
  async refreshSummary(
    @Param('contactId') contactId: string,
    @Query('ownerId') ownerId?: string
  ) {
    const numericOwnerId = ownerId ? Number(ownerId) : 0;
    return this.memoryService.refreshSummary(contactId, numericOwnerId);
  }

  @Post('profiles/:contactId/merge-duplicates')
  async mergeDuplicates(
    @Param('contactId') contactId: string,
    @Query('ownerId') ownerId?: string
  ) {
    const numericOwnerId = ownerId ? Number(ownerId) : 0;
    return this.memoryService.mergeDuplicates(contactId, numericOwnerId);
  }

  @Post('query')
  async queryKnowledgeGraph(
    @Body('ownerId') ownerId: number,
    @Body('query') queryText: string
  ) {
    return this.memoryService.queryKnowledgeGraph(Number(ownerId), queryText);
  }
}
