import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { posts } from 'src/drizzle/schema/posts.schema';
import { eq } from 'drizzle-orm';
import { users } from 'src/drizzle/schema/users.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { ConfigService } from '@nestjs/config';
import { PostReturn } from 'src/types';

@Injectable()
export class PostService {
  private readonly jwtSecret: string
  constructor(@Inject(DRIZZLE) private db: DrizzleDB, private configService: ConfigService) {
    this.jwtSecret = this.configService.getOrThrow("JWT_SECRET");
  }

  async getPostById(postId: number): Promise<PostReturn> {
    const post = await this.db.select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      author: {
        id: users.id,
        name: users.name,
        email: users.email
      }
    }).from(posts).leftJoin(users, eq(posts.authorId, users.id)).where(eq(posts.id, postId))[0];

    if (!post) {
      throw new NotFoundException('Post with id: ${postId} not found');
    }

    return post;
  }

  async create(userId: number, data: CreatePostDto): Promise<PostReturn> {
    const post = (await this.db.insert(posts).values({
      title: data.title,
      content: data.content,
      authorId: userId
    }).returning({id: posts.id}))[0];

    return this.getPostById(post.id);
  }

  async findAll(): Promise<PostReturn[]> {
    return await this.db.query.posts.findMany({
      with: {
        author: {
          columns: {
            password: false,
          }
        },
      },
      columns: {
        authorId: false,
      }
    });
  }

  async findOne(id: number): Promise<PostReturn> {
    return await this.db.query.posts.findFirst({
      where: eq(users.id, id),
      with: {
        author: {
          columns: {
            password: false,
          }
        }
      },
      columns: {
        authorId: false,
      }
    });
  }

  async update(id: number, userId: number, data: CreatePostDto): Promise<PostReturn> {
    const post = await this.db.query.posts.findFirst({
      where: eq(posts.id, id)
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId != userId) {
      throw new UnauthorizedException("Only author can edit his post");
    }

    await this.db.update(posts).set({
      title: data.title,
      content: data.content,
    }).where(eq(posts.id, id));
    
    return this.getPostById(id);
  }

  async remove(id: number): Promise<void> {
    await this.db.delete(posts).where(eq(posts.id, id));
  }
}
