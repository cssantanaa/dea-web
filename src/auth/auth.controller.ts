import { Controller, Post, Patch, Body, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { MudarSenhaDto } from './dto/mudar-senha.dto';
import { JwtAuthGuard}  from './jwt-auth.guard';
import { Usuario } from 'src/common/decorators/usuario.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  mudarSenha(@Body() dto: MudarSenhaDto, @Usuario() usuario: any) {
    return this.auth.mudarSenha(usuario.id, dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  logout(@Usuario() usuario: any) {
    return this.auth.logout(usuario.id);
  }
}