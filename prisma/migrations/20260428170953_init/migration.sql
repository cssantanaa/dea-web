-- CreateEnum
CREATE TYPE "StatusEstabelecimento" AS ENUM ('rascunho', 'ativo', 'inativo', 'encerrado');

-- CreateEnum
CREATE TYPE "TipoOperacao" AS ENUM ('permanente', 'evento');

-- CreateEnum
CREATE TYPE "CategoriaEstabelecimento" AS ENUM ('shopping', 'faculdade', 'hospital', 'estadio', 'centro_de_convencoes', 'escritorio', 'industria', 'outros');

-- CreateEnum
CREATE TYPE "StatusConfiguracaoMapa" AS ENUM ('pendente', 'em_configuracao', 'publicado');

-- CreateEnum
CREATE TYPE "TipoPoi" AS ENUM ('DEA', 'extintor', 'saida_emergencia', 'escada', 'elevador', 'rampa', 'ponto_encontro', 'posto_medico', 'hidrante', 'outro');

-- CreateEnum
CREATE TYPE "Disponibilidade" AS ENUM ('ativo', 'inativo', 'em_manutencao');

-- CreateEnum
CREATE TYPE "Visibilidade" AS ENUM ('publico', 'somente_socorristas');

-- CreateEnum
CREATE TYPE "Acessibilidade" AS ENUM ('acessivel', 'nao_acessivel', 'desconhecido');

-- CreateEnum
CREATE TYPE "StatusCodigo" AS ENUM ('ativo', 'revogado', 'expirado');

-- CreateEnum
CREATE TYPE "StatusBarreira" AS ENUM ('agendada', 'ativa', 'inativa', 'encerrada');

-- CreateEnum
CREATE TYPE "SeveridadeBarreira" AS ENUM ('informativa', 'atencao', 'critico');

-- CreateEnum
CREATE TYPE "ResultadoAuditoria" AS ENUM ('sucesso', 'falha');

-- CreateTable
CREATE TABLE "estabelecimentos" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "clienteOrganizador" VARCHAR(80) NOT NULL,
    "tipoOperacao" "TipoOperacao" NOT NULL,
    "dataInicioEvento" TIMESTAMP(3),
    "dataFimEvento" TIMESTAMP(3),
    "cnpj" VARCHAR(14) NOT NULL,
    "categoria" "CategoriaEstabelecimento" NOT NULL,
    "detalheCategoria" VARCHAR(60),
    "rua" VARCHAR(150) NOT NULL,
    "numero" VARCHAR(10) NOT NULL,
    "complemento" VARCHAR(60),
    "bairro" VARCHAR(80) NOT NULL,
    "cidade" VARCHAR(80) NOT NULL,
    "estado" VARCHAR(2) NOT NULL,
    "cep" VARCHAR(8) NOT NULL,
    "capacidadeEstimada" INTEGER NOT NULL,
    "statusConfiguracaoMapa" "StatusConfiguracaoMapa" NOT NULL DEFAULT 'pendente',
    "status" "StatusEstabelecimento" NOT NULL DEFAULT 'rascunho',
    "observacoesInternas" TEXT,
    "criadoPor" VARCHAR(36),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoPor" VARCHAR(36),
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estabelecimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administradores" (
    "id" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "usuario" VARCHAR(20) NOT NULL,
    "hashSenha" TEXT NOT NULL,
    "telefoneSms" VARCHAR(13),
    "exigirTrocaSenha" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "permissoes" TEXT[],
    "observacoesInternas" VARCHAR(300),
    "criadoPor" VARCHAR(36),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoPor" VARCHAR(36),
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pois" (
    "id" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "tipo" "TipoPoi" NOT NULL,
    "detalheTipo" VARCHAR(40),
    "nome" VARCHAR(60) NOT NULL,
    "andar" VARCHAR(50) NOT NULL,
    "posicao" JSONB NOT NULL,
    "acessibilidade" "Acessibilidade" NOT NULL DEFAULT 'desconhecido',
    "disponibilidade" "Disponibilidade" NOT NULL DEFAULT 'ativo',
    "visibilidade" "Visibilidade" NOT NULL DEFAULT 'publico',
    "capacidadeOuDetalhe" VARCHAR(40),
    "orientacaoTextual" VARCHAR(120),
    "prioridadeRota" INTEGER NOT NULL DEFAULT 3,
    "criadoPor" VARCHAR(36),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoPor" VARCHAR(36),
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pois_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socorristas" (
    "id" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "usuario" VARCHAR(20) NOT NULL,
    "hashSenha" TEXT NOT NULL,
    "telefoneSms" VARCHAR(13),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoesInternas" VARCHAR(300),
    "ultimoLoginApp" TIMESTAMP(3),
    "criadoPor" VARCHAR(36),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoPor" VARCHAR(36),
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "socorristas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigo_acesso" (
    "id" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "codigo" VARCHAR(6) NOT NULL,
    "modoGeracao" VARCHAR(10) NOT NULL DEFAULT 'automatico',
    "descricao" VARCHAR(60),
    "validoDe" TIMESTAMP(3),
    "validoAte" TIMESTAMP(3),
    "status" "StatusCodigo" NOT NULL DEFAULT 'ativo',
    "gerarQr" BOOLEAN NOT NULL DEFAULT true,
    "imagemQr" TEXT,
    "criadoPor" VARCHAR(36),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoPor" VARCHAR(36),
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "codigo_acesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redes_wifi" (
    "id" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "nomeExibicao" VARCHAR(60) NOT NULL,
    "ssid" VARCHAR(32) NOT NULL,
    "possuiPortalCativo" BOOLEAN NOT NULL DEFAULT false,
    "instrucoesConexao" VARCHAR(120),
    "validoDe" TIMESTAMP(3),
    "validoAte" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoPor" VARCHAR(36),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoPor" VARCHAR(36),
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "redes_wifi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barreiras" (
    "id" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "tipo" VARCHAR(40) NOT NULL,
    "detalheTipo" VARCHAR(40),
    "nome" VARCHAR(60) NOT NULL,
    "andar" VARCHAR(50) NOT NULL,
    "posicao" JSONB NOT NULL,
    "severidade" "SeveridadeBarreira" NOT NULL DEFAULT 'informativa',
    "visibilidade" "Visibilidade" NOT NULL DEFAULT 'publico',
    "inicioPeriodo" TIMESTAMP(3) NOT NULL,
    "fimPeriodo" TIMESTAMP(3),
    "status" "StatusBarreira" NOT NULL DEFAULT 'agendada',
    "mensagemCurta" VARCHAR(120),
    "ativadoEm" TIMESTAMP(3),
    "encerradoEm" TIMESTAMP(3),
    "criadoPor" VARCHAR(36),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoPor" VARCHAR(36),
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barreiras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_auditoria" (
    "id" TEXT NOT NULL,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioResponsavelId" VARCHAR(36),
    "papelUsuarioResponsavel" VARCHAR(20),
    "estabelecimentoId" TEXT,
    "tipoEvento" VARCHAR(60) NOT NULL,
    "recursoAfetado" VARCHAR(60) NOT NULL,
    "idRecursoAfetado" VARCHAR(36),
    "resultado" "ResultadoAuditoria" NOT NULL DEFAULT 'sucesso',
    "origemRequisicao" VARCHAR(50),
    "metadados" JSONB,

    CONSTRAINT "log_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administradores_usuario_estabelecimentoId_key" ON "administradores"("usuario", "estabelecimentoId");

-- CreateIndex
CREATE UNIQUE INDEX "pois_estabelecimentoId_tipo_nome_andar_key" ON "pois"("estabelecimentoId", "tipo", "nome", "andar");

-- CreateIndex
CREATE UNIQUE INDEX "socorristas_usuario_estabelecimentoId_key" ON "socorristas"("usuario", "estabelecimentoId");

-- CreateIndex
CREATE UNIQUE INDEX "codigo_acesso_estabelecimentoId_codigo_key" ON "codigo_acesso"("estabelecimentoId", "codigo");

-- CreateIndex
CREATE INDEX "log_auditoria_estabelecimentoId_registradoEm_idx" ON "log_auditoria"("estabelecimentoId", "registradoEm");

-- CreateIndex
CREATE INDEX "log_auditoria_tipoEvento_idx" ON "log_auditoria"("tipoEvento");

-- AddForeignKey
ALTER TABLE "administradores" ADD CONSTRAINT "administradores_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pois" ADD CONSTRAINT "pois_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socorristas" ADD CONSTRAINT "socorristas_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codigo_acesso" ADD CONSTRAINT "codigo_acesso_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redes_wifi" ADD CONSTRAINT "redes_wifi_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barreiras" ADD CONSTRAINT "barreiras_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_auditoria" ADD CONSTRAINT "log_auditoria_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
