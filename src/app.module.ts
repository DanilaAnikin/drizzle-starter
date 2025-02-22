import { Module } from '@nestjs/common';
import { DrizzleModule } from './drizzle/drizzle.module';
import { PostModule } from './post/post.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    DrizzleModule,
    PostModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    CommentModule,
  ],
})
export class AppModule {}
