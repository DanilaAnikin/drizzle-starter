import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    password?: string

    @IsString()
    @IsOptional()
    oldPassword?: string
}