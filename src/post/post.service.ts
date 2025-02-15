import { Inject, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { posts } from 'src/drizzle/schema/posts.schema';
import { eq } from 'drizzle-orm';
import { users } from 'src/drizzle/schema/users.schema';

@Injectable()
export class PostService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}
  create(createPostDto: CreatePostDto) {
    return 'This action adds a new post';
  }

  async findAll() {
    return await this.db.query.posts.findMany({
      with: {
        author: {
          with: {
            usersToGroups: {
              with: {
                group: true,
              }
            }
          }
        },
      },
    });
  }

  async findOne(id: number) {
    return await this.db.query.posts.findMany({
      where: eq(users.id, id),
      with: {
        author: {
          with: {
            usersToGroups: {
              with: {
                group: true,
              }
            }
          }
        }
      }
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    return await this.db.update(posts).set({
      title: 'AAAAAAAAA',
    }).where(eq(posts.id, id));
  }

  async remove(id: number) {
    return await this.db.delete(posts).where(eq(posts.id, id));
  }
}
