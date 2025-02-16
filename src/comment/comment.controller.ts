import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from 'src/auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UserId } from 'src/user.decorator';

@Controller('comment')
export class CommentController {
    constructor(private commentService: CommentService) {}
    @Get(':postId')
    @UseGuards(AuthGuard)
    findAll(
        @Param('postId', ParseIntPipe) postId: number,
    ) {
        return this.commentService.findAll(postId);
    }

    @Post('create-comment')
    @UseGuards(AuthGuard)
    create(
        @Body() body: CreateCommentDto,
        @UserId() userId: number,
    ) {
        return this.commentService.create(userId, body)
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    update(
        @Param('id', ParseIntPipe) id: number,
        @UserId() userId: number,
        @Body() body: CreateCommentDto,
    ) {
        return this.commentService.update(id, userId, body)
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    remove(
        @Param('id', ParseIntPipe) id: number,
        @UserId() userId: number,
    ) {
        return this.commentService.remove(id, userId);
    }
}
