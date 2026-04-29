// import {
//   IsDateString,
//   IsEnum,
//   IsInt,
//   IsOptional,
//   IsString,
//   Max,
//   Min,
// } from 'class-validator';
// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { Transform, Type } from 'class-transformer';

// export class AuditQueryDto {
//   @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Início do período (obrigatório)' })
//   @IsDateString({}, { message: 'Informe uma data de início válida.' })
//   periodStart: string;

//   @ApiProperty({ example: '2025-12-31T23:59:59Z', description: 'Fim do período (obrigatório, deve ser posterior ao início)' })
//   @IsDateString({}, { message: 'Informe uma data de fim válida.' })
//   periodEnd: string;

//   @ApiPropertyOptional({
//     example: 'admin',
//     description: 'Filtrar por papel do responsável: super_admin, admin, rescuer, public',
//   })
//   @IsOptional()
//   @IsString()
//   responsibleUserRole?: string;

//   @ApiPropertyOptional({
//     example: 'poi.created',
//     description: 'Filtrar por tipo de evento (aceita parcial)',
//   })
//   @IsOptional()
//   @IsString()
//   eventType?: string;

//   @ApiPropertyOptional({
//     example: 'poi',
//     description: 'Filtrar pelo recurso afetado (establishment, admin, poi, rescuer, etc.)',
//   })
//   @IsOptional()
//   @IsString()
//   affectedResource?: string;

//   @ApiPropertyOptional({ enum: ['sucesso', 'falha'] })
//   @IsOptional()
//   @IsEnum(['sucesso', 'falha'], { message: 'Resultado deve ser "sucesso" ou "falha".' })
//   result?: 'sucesso' | 'falha';

//   @ApiPropertyOptional({ example: 1, default: 1 })
//   @IsOptional()
//   @Type(() => Number)
//   @IsInt()
//   @Min(1)
//   page?: number;

//   @ApiPropertyOptional({ example: 50, default: 50 })
//   @IsOptional()
//   @Type(() => Number)
//   @IsInt()
//   @Min(1)
//   @Max(100)
//   limite?: number;
// }
