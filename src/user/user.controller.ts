import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth.guard';
import { UserId } from 'src/user.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'express';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}
    @Get()
    @UseGuards(AuthGuard)
    findAll(
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
        @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
        @Query('order_by', new DefaultValuePipe('id')) orderBy: string,
        @Query('order', new DefaultValuePipe('asc')) order: string,
        @UserId() userId: number
    ) {
        return this.userService.findAll(limit, page, orderBy, order);
    }

    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.userService.findOne(id);
    }

    @Get('get-logged-user')
    @UseGuards(AuthGuard)
    getUserFromToken(
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.userService.getUserFromToken(res);
    }

    @Post('register')
    createUser(
        @Body() body: CreateUserDto
    ) {
        return this.userService.createUser(body);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    updateUser(
        @Body() body: UpdateUserDto,
        @UserId() userId: number
    ) {
        return this.userService.updateUser(userId, body);
    }

    @Post('login')
    async loginUser(
        @Body() body: LoginUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const token = await this.userService.loginUser(body);
        res.setHeader('Authorization', `Bearer ${token}`);
        
        return token;
    }
}
