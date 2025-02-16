import { Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "src/drizzle/drizzle.module";
import { comments } from "src/drizzle/schema/comments.schema";
import { DrizzleDB } from "src/drizzle/types/drizzle";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { users } from "src/drizzle/schema/users.schema";
import { posts } from "src/drizzle/schema/posts.schema";
import { DeleteCommentDto } from "./dto/delete-post.dto";

@Injectable()
export class CommentService {
    private readonly jwtSecret: string

    constructor(@Inject(DRIZZLE) private db: DrizzleDB, private configService: ConfigService) {
        this.jwtSecret = this.configService.getOrThrow("JWT_SECRET");
    }

    async getCommentById(commentId: number) {
        return await this.db
            .select({
                id: comments.id,
                text: comments.text,
                author: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                },
                post: {
                    id: posts.id,
                    name: posts.title,
                    content: posts.content,
                    authorId: posts.authorId,
                }
            })
            .from(comments)
            .leftJoin(users, eq(comments.authorId, users.id))
            .leftJoin(posts, eq(comments.postId, posts.id))
            .where(eq(comments.id, commentId));
    }
    
    findAll(postId: number) {
        return this.db.query.comments.findMany({
            where: eq(comments.postId, postId),
        });
    }

    async create(userId: number, data: CreateCommentDto) {
        const comment = (await this.db.insert(comments).values({
            text: data.text,
            postId: data.postId,
            authorId: userId,
        }).returning())[0];

        return this.getCommentById(comment.id);
    }

    async update(id: number, userId: number, data: CreateCommentDto) {
        const comment = await this.db.query.comments.findFirst({
            where: eq(comments.id, id),
        });

        if (!comment) {
            throw new NotFoundException(`Post with id: ${id} not found`);
        }

        if (comment.authorId !== userId) {
            throw new UnauthorizedException('Only author can edit his comment');
        }

        await this.db.update(comments).set({
            text: data.text,
        }).where(eq(comments.id, id));


        return this.getCommentById(id);
    }

    async remove(id: number, userId: number, data: DeleteCommentDto) {
        const comment = await this.db.query.comments.findFirst({
            where: eq(comments.id, id),
        });

        if (!comment) {
            throw new NotFoundException(`Comment with id: ${id} not found`);
        }

        const postAuthor = await this.db.select({
            authorId: posts.id,
        }).from(posts).where(eq(posts.id, data.postId))[0];

        if (comment.authorId !== userId && comment.authorId !== postAuthor.authorId) {
            throw new UnauthorizedException('Only author of comment or author of post can remove his comment');
        }

        return await this.db.delete(comments).where(eq(comments.id, id));
    }
}