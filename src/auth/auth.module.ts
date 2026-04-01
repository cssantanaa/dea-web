import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            imports:[ConfigModule],
            useFactory: (config: ConfigService) => ({
                secret: config.get('JWT_SECRET'),
                signOptions: { expiresIn: config.get('JWT_EXPIRES_IN')},
            }),
        inject:[ConfigService]
        }),
    ],

    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [JwtModule]
})
export class AuthModule {}