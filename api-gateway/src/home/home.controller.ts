import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../common/guards/auth.guard';
import { HomeService } from './home.service';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@Controller('api/v1/dashboard')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('summary')
  @UseGuards(AuthGuard)
  async getSummary(@Req() req: AuthenticatedRequest) {
    return this.homeService.getDashboardSummary(req.user.userId);
  }
}