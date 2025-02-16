import { IsNumber } from "class-validator";

export class DeleteCommentDto {
    @IsNumber()
    postId: number
}