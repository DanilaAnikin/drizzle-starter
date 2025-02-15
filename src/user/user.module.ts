import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [DrizzleModule]
})
export class UserModule {}
