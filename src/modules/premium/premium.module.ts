import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { PremiumService } from './premium.service';
import { PremiumGuard } from './guards/premium.guard';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [PremiumService, PremiumGuard],
  exports: [PremiumService, PremiumGuard],
})
export class PremiumModule {}
