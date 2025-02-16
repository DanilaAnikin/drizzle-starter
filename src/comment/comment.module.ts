import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  controllers: [CommentController],
    providers: [CommentService],
    imports: [DrizzleModule]
})
export class CommentModule {}
