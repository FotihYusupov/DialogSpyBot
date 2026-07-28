import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PremiumService } from '../premium.service';
import { IS_PREMIUM_KEY } from '../decorators/require-premium.decorator';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly premiumService: PremiumService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isRequired = this.reflector.getAllAndOverride<boolean>(IS_PREMIUM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If endpoint doesn't explicitly require premium via decorator, allow unless guard is applied directly
    if (isRequired === false) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by JwtAuthGuard or session

    if (!user) {
      throw new ForbiddenException('User authentication required.');
    }

    const active = this.premiumService.isPremiumActive(user);
    if (!active) {
      throw new ForbiddenException('This feature requires an active Premium subscription.');
    }

    return true;
  }
}
