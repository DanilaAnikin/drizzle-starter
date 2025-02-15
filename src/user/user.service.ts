import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { asc, desc, eq, InferInsertModel } from 'drizzle-orm';
import { users } from 'src/drizzle/schema/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
    private readonly jwtSecret: string

    constructor(@Inject(DRIZZLE) private db: DrizzleDB, private configService: ConfigService) {
        this.jwtSecret = this.configService.getOrThrow("JWT_SECRET");
    }

    findAll(limit: number, page: number, orderBy: string, order: string) {
        const orderFunc = order === "asc" ? asc : desc;
        const orderByParam = ["id", "name", "email"].includes(orderBy) ? users[orderBy] : users.id;

        return this.db.query.users.findMany({
            limit,
            offset: page*limit,
            orderBy: [orderFunc(orderByParam)],
            columns: {
                password: false,
            },
        });
    }

    async findOne(id: number) {
        const user = await this.db.query.users.findFirst({
            where: eq(users.id, id),
            columns: {
                password: false,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with id: ${id} not found`)
        }

        return user;
    }

    async createUser(data: CreateUserDto) {
        const hashPassword = await bcrypt.hash(data.password, 10)

        const user = await this.db.query.users.findFirst({
            where: eq(users.email, data.email),
            columns: {
                password: false,
            },
        });

        if (user) {
            throw new ConflictException('User with this email already exists');
        }


        const newUser = await this.db.insert(users).values({
            name: data.name,
            email: data.email,
            password: hashPassword,
        }).returning({ id: users.id, name: users.name, email: users.email });
        
        return jwt.sign({ id: newUser[0].id }, this.jwtSecret, { expiresIn: '30d' });
    }

    async updateUser(id: number, data: UpdateUserDto) {
        const user = await this.db.query.users.findFirst({
            where: eq(users.id, id),
        });
        
        if (!user) {
            throw new NotFoundException(`User with id: ${id} not found`);
        }
        if (!data.name && !(data.oldPassword && data.password)) {
            throw new BadRequestException('No data to update');
        }

        const updateData: Partial<InferInsertModel<typeof users>> = {};
        if(data.name) updateData.name = data.name;

        if (data.password && data.oldPassword) {
            const passwordMatch = await bcrypt.compare(data.oldPassword, user.password);
            if(!passwordMatch) {
                throw new BadRequestException("Passwords don't match");
            }
            const newHashPassword = await bcrypt.hash(data.password, 10);
            updateData.password = newHashPassword;
        }
        
        return await this.db.update(users).set({
        ...updateData
        }).where(eq(users.id, id)).returning({ id: users.id, name: users.name, email: users.email });
    }

    async loginUser(data: LoginUserDto) {
        const user = await this.db.query.users.findFirst({
            where: eq(users.email, data.email)
        });

        if (!user) {
            throw new NotFoundException(`User with email ${data.email} not found`);
        }

        const passwordMatch = await bcrypt.compare(data.password, user.password);

        if (!passwordMatch) {
            throw new BadRequestException("Passwords don't match");
        }

        return jwt.sign({ id: user.id }, this.jwtSecret, { expiresIn: '30d' });
    }
}
