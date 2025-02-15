import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly jwtSecret: string;
    constructor(private configService: ConfigService){
        this.jwtSecret = this.configService.getOrThrow("JWT_SECRET")
    }

    canActivate(
        context: ExecutionContext,
        ): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization']
        
        if(!authHeader){
            return false;
        }

        const token = authHeader.split(' ')[1];
        try {

            const verified = jwt.verify(token, this.jwtSecret) as {id: number, iat: number, exp: number}
            request['user'] = verified;
        } catch(e){
            return false
        }

        return true;
    }
}
