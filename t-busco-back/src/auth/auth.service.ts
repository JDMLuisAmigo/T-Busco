import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './entities/usuario.entity';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

const RONDAS_SAL = 10; // más alto = más lento de "romper" por fuerza bruta, pero también más lento de calcular

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  // "sub" es el nombre estándar (de JWT) para el id del dueño del token
  private generarToken(usuario: Usuario) {
    const payload = { sub: usuario.id, correo: usuario.correo, rol: usuario.rol };
    return this.jwtService.sign(payload);
  }

  // Nunca devolvemos contrasenaHash al frontend, ni por error
  private aSalida(usuario: Usuario) {
    return { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol };
  }

  async registrar(dto: RegistroDto) {
    const correo = dto.correo.toLowerCase().trim();
    const existente = await this.usuarios.findOne({ where: { correo } });
    if (existente) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }

    const contrasenaHash = await bcrypt.hash(dto.contrasena, RONDAS_SAL);
    const usuario = this.usuarios.create({ nombre: dto.nombre.trim(), correo, contrasenaHash, rol: dto.rol });
    await this.usuarios.save(usuario);

    return { usuario: this.aSalida(usuario), token: this.generarToken(usuario) };
  }

  async iniciarSesion(dto: LoginDto) {
    const correo = dto.correo.toLowerCase().trim();
    const usuario = await this.usuarios.findOne({ where: { correo } });

    // A propósito, el mismo mensaje tanto si el correo no existe como si la
    // contraseña está mal: así no le decimos a quien intenta entrar cuáles
    // correos SÍ están registrados en el sistema.
    if (!usuario) throw new UnauthorizedException('Correo o contraseña incorrectos.');

    const coincide = await bcrypt.compare(dto.contrasena, usuario.contrasenaHash);
    if (!coincide) throw new UnauthorizedException('Correo o contraseña incorrectos.');

    return { usuario: this.aSalida(usuario), token: this.generarToken(usuario) };
  }

  async obtenerPorId(id: string) {
    const usuario = await this.usuarios.findOne({ where: { id } });
    return usuario ? this.aSalida(usuario) : null;
  }
}
