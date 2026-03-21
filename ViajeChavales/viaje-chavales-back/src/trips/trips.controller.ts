import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ProposalStatus, TripRole } from '@prisma/client';
import { Request } from 'express';
import { AssignTripRoleDto } from './dto/assign-trip-role.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { CreateProposalDto, UpdateProposalStatusDto } from './dto/proposal.dto';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  async create(@Body() createTripDto: CreateTripDto, @Req() req: Request) {
    return this.tripsService.create(createTripDto, req['user'].sub, req['user'].group);
  }

  @Get()
  async findAll(@Req() req: Request) {
    return this.tripsService.findAll(req['user'].group);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tripsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
    @Req() req: Request,
  ) {
    return this.tripsService.update(+id, updateTripDto, req['user'].sub);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateTripStatusDto: UpdateTripStatusDto,
    @Req() req: Request,
  ) {
    return this.tripsService.updateStatus(+id, updateTripStatusDto, req['user'].sub);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.tripsService.remove(+id, req['user'].sub);
  }

  @Post(':id/roles')
  async assignRole(
    @Param('id') id: string,
    @Body() assignTripRoleDto: AssignTripRoleDto,
    @Req() req: Request,
  ) {
    return this.tripsService.assignRole(+id, req['user'].sub, assignTripRoleDto);
  }

  @Delete(':id/roles')
  async removeRole(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('role') role: TripRole,
    @Req() req: Request,
  ) {
    if (!userId || !role || !Object.values(TripRole).includes(role)) {
      throw new BadRequestException('userId and role are required');
    }

    return this.tripsService.removeRole(+id, req['user'].sub, userId, role);
  }

  @Post(':id/proposals')
  async createProposal(
    @Param('id') id: string,
    @Body() createProposalDto: CreateProposalDto,
    @Req() req: Request,
  ) {
    return this.tripsService.createProposal(+id, req['user'].sub, createProposalDto);
  }

  @Delete(':tripId/proposals/:proposalId')
  async deleteProposal(
    @Param('tripId') tripId: string,
    @Param('proposalId') proposalId: string,
    @Req() req: Request,
  ) {
    return this.tripsService.deleteProposal(+tripId, +proposalId, req['user'].sub);
  }

  @Post(':tripId/proposals/:proposalId/votes')
  async addVote(
    @Param('tripId') tripId: string,
    @Param('proposalId') proposalId: string,
    @Req() req: Request,
  ) {
    return this.tripsService.addProposalVote(+tripId, +proposalId, req['user'].sub);
  }

  @Delete(':tripId/proposals/:proposalId/votes')
  async removeVote(
    @Param('tripId') tripId: string,
    @Param('proposalId') proposalId: string,
    @Req() req: Request,
  ) {
    return this.tripsService.removeProposalVote(+tripId, +proposalId, req['user'].sub);
  }

  @Patch(':tripId/proposals/:proposalId/status')
  async updateProposalStatus(
    @Param('tripId') tripId: string,
    @Param('proposalId') proposalId: string,
    @Body() updateProposalStatusDto: UpdateProposalStatusDto,
    @Req() req: Request,
  ) {
    if (
      updateProposalStatusDto.status !== ProposalStatus.Proposed &&
      updateProposalStatusDto.status !== ProposalStatus.Accepted
    ) {
      throw new BadRequestException('Only Proposed and Accepted status changes are allowed');
    }

    return this.tripsService.updateProposalStatus(
      +tripId,
      +proposalId,
      req['user'].sub,
      updateProposalStatusDto.status,
    );
  }
}
