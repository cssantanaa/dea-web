import { Timestamp } from "firebase/firestore";

export type Tipo = "super_admin" | "admin" | "socorrista";

export type PermissaoAdmin = "gerenciar_pois" | "gerenciar_socorristas" | "gerenciar_numeros_internos" | "gerenciar_codigos_qr" | "gerenciar_redes_wifi" | "consultar_metricas" | "gerenciar_barreiras" | "consultar_historico";

export interface Usuario {
  id: string;
  tipo: Tipo;
  nome: string;
  usuario: string;
  telefone_sms?: string;
  status: "ativo" | "inativo";
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

export interface SuperAdmin extends Usuario {
    tipo: "super_admin";
}

export interface Admin extends Usuario {
    tipo: "admin";
    estabelecimentoId: string;
    observacao?: string;
    ultimo_acesso: Timestamp;
}

export interface Socorrista extends Usuario {
    tipo: "socorrista";
    estabelecimentoId: string;
    observacao?: string;
    ultimo_acesso: Timestamp;
}

// export type Sistema = SuperAdmin | Admin | Socorrista;

export type TipoOperacao = "permanente" | "evento";
export type StatusEstabelecimento = "rascunho" | "ativo" | "inativo" | "encerrado";
export type StatusMapa = "pendente" | "em_configuracao" | "publicado";

export interface Endereco {
    cep: string;
    uf: string;
    cidade: string;
    bairro: string;
    numero: string;
    logradouro: string;
    complemento?: string;
}

export interface Estabelecimento {
    id: string;
    nomeEstabelecimento: string;
    clienteOrganizador: string;
    tipoOperacao: TipoOperacao;
    documentoIdentificacao: string; //CNPJ
    categoria: "shopping" | "faculdade" | "hospital" | "estadio" | "centro_de_convencoes" | "escritorio" | "industria" | "outros";
    categoriaOutros?: string;
    endereco: Endereco;
    capacidade: number;
    statusEstabelecimento: StatusEstabelecimento;
    statusMapa: StatusMapa;
    observacao?: string;
    inicioEvento?: Timestamp;
    fimEvento?: Timestamp;
}

export type tipoPoi = "DEA" | "extintor" | "saida_emergencia" | "escada" | "elevador" | "rampa" | "ponto_encontro" | "posto_medico" | "hidrante" | "outros";

export interface PontoCritico {
    id: string;
    estabelecimentoId: string;
    tipoPoi: tipoPoi;
    tipoOutro?: string;
    nomePoi: string;
    andar: string;
    posicao_mapa: {
        tipoGeometria: "ponto" | "poligono";
        coordenadas: any;
    };
    acessibilidade: "assessivel" | "nao_acessivel" | "desconhecido";
    disponibilidade: "ativo" | "inativo" | "em_manutencao";
    visibilidade: "publico" | "somente_socorristas";
    capacidade_detalhe: {
        dea: string;
        extintor: string;
        elevadorEscadaRampa: string;
        postoMedico: string;
        validacao: string;
        mensagem: Text;
    }
    orientacao_textual?: string;
    prioridade_rota: number;
    auditoria: {
        criadoPor: string;
        criadoEm: Timestamp;
        alteradoPor?: string;
        alteradoEm?: Timestamp;
    };
}

export interface RedeWifi {
    id: string;
    estabelecimentoId: string;
    nomeRede: string;
    ssid: string;
    possuiPortalCaptivo: boolean;
    instrucoesConexao?: string;
    status: "ativo" | "inativo";
    validadeInicio: Timestamp;
    validadeFim: Timestamp;
    //     auditoria: {
    //     criadoPor: string;
    //     criadoEm: Timestamp;
    //     alteradoPor?: string;
    //     alteradoEm?: Timestamp;
    // };
}

export interface Barreira {
    id: string;
    estabelecimentoId: string;
    tipo: "área interditada" | "passagem bloqueada" | "escada inoperante" | "elevador inoperante" | "rampa inoperante" | "obra" | "evento temporário" | "risco localizado" | "outro";
    tipoOutro?: string;
    nomeBarreira: string;
    andar: string;
    posicaoMapa: any;
    severidade: "informativa" | "atencao" | "critico";
    visibilidade: "publico" | "somente_socorristas";
    status: "agendada" | "ativa" | "inativa" | "encerrada";
    mensagem?: string;
    periodoInicial: Timestamp;
    periodoFinal: Timestamp;
    // auditoria: {
    //     criadoPor: string;
    //     criadoEm: Timestamp;
    //     alteradoPor?: string;
    //     alteradoEm?: Timestamp;
    // };
}

export interface AuditLog {
    id: string;
    dataHoraRegistro: Timestamp;
    usuarioResponsavelId: string;
    usuarioTipo: Tipo | "publico" | "sistema";
    estabelecimentoId: string;
    tipoEvento: "criacao" | "edicao" | "exclusao" | "ativacao" | "inativacao" | "login" | "atendimento";
    recursoAfetado: "estabelecimento" | "admin" | "socorrista" | "poi" | "codigo_acesso" | "wifi" | "barreira";
    recursoId: string;
    resultado: "sucesso" | "falha";
    origemRequisicao: string;
}